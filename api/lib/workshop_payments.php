<?php
require_once __DIR__ . '/stripe_helpers.php';
require_once __DIR__ . '/mailer.php';
require_once __DIR__ . '/ledger.php';

function workshop_build_checkin_url(string $publicCode): string {
  $host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '');
  return rtrim($host, '/') . '/workshop_checkin_card.html?code=' . urlencode($publicCode);
}

function workshop_send_enrollment_email(array $participant, array $workshop, array $enrollment, string $warning): void {
  if (empty($participant['email'])) return;
  $subject = 'Inscrição confirmada no workshop';
  $html = mailer_render('workshop_enrollment_pending.php', [
    'participant_name' => $participant['name'] ?? 'Participante',
    'workshop_title' => $workshop['title'] ?? 'Workshop',
    'workshop_date' => $workshop['date'] ?? '',
    'workshop_time' => trim(($workshop['time_start'] ?? '') . ' - ' . ($workshop['time_end'] ?? '')),
    'workshop_location' => trim(($workshop['room_city'] ?? '') . ' - ' . ($workshop['room_state'] ?? '')),
    'payment_notice' => $warning,
  ]);
  mailer_send([['email' => $participant['email'], 'name' => $participant['name'] ?? '']], $subject, $html);
}

function workshop_send_ticket_email(array $participant, array $workshop, array $enrollment): void {
  if (empty($participant['email']) || empty($enrollment['public_code'])) return;
  $checkinUrl = workshop_build_checkin_url($enrollment['public_code']);
  $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' . urlencode($checkinUrl);
  $subject = 'Seu ingresso do workshop';
  $html = mailer_render('workshop_ticket.php', [
    'participant_name' => $participant['name'] ?? 'Participante',
    'workshop_title' => $workshop['title'] ?? 'Workshop',
    'workshop_date' => $workshop['date'] ?? '',
    'workshop_time' => trim(($workshop['time_start'] ?? '') . ' - ' . ($workshop['time_end'] ?? '')),
    'workshop_location' => trim(($workshop['room_city'] ?? '') . ' - ' . ($workshop['room_state'] ?? '')),
    'ticket_code' => $enrollment['public_code'],
    'qr_url' => $qrUrl,
  ]);
  mailer_send([['email' => $participant['email'], 'name' => $participant['name'] ?? '']], $subject, $html);
}

function workshop_send_cancel_email(array $participant, array $workshop, string $refundNote): void {
  if (empty($participant['email'])) return;
  $subject = 'Workshop cancelado';
  $html = mailer_render('workshop_cancelled.php', [
    'participant_name' => $participant['name'] ?? 'Participante',
    'workshop_title' => $workshop['title'] ?? 'Workshop',
    'workshop_date' => $workshop['date'] ?? '',
    'workshop_time' => trim(($workshop['time_start'] ?? '') . ' - ' . ($workshop['time_end'] ?? '')),
    'workshop_location' => trim(($workshop['room_city'] ?? '') . ' - ' . ($workshop['room_state'] ?? '')),
    'refund_note' => $refundNote,
  ]);
  mailer_send([['email' => $participant['email'], 'name' => $participant['name'] ?? '']], $subject, $html);
}

function workshop_charge_pending(PDO $pdo, int $workshopId): array {
  if ($workshopId <= 0) return ['attempted' => 0, 'paid' => 0, 'failed' => 0];
  zeefe_stripe_ensure_schema($pdo);
  $stripe = zeefe_stripe_client($GLOBALS['config']);

  $stmtW = $pdo->prepare('SELECT * FROM workshops WHERE id = ? LIMIT 1');
  $stmtW->execute([$workshopId]);
  $workshop = $stmtW->fetch(PDO::FETCH_ASSOC) ?: null;
  if (!$workshop) return ['attempted' => 0, 'paid' => 0, 'failed' => 0];
  $feePct = 0.0;
  try {
    $stmtFee = $pdo->prepare('SELECT fee_pct_workshop, fee_pct FROM advertisers WHERE id = ? LIMIT 1');
    $stmtFee->execute([(int)$workshop['advertiser_id']]);
    $feeRow = $stmtFee->fetch(PDO::FETCH_ASSOC) ?: [];
    $feePct = (float)($feeRow['fee_pct_workshop'] ?? 0.0);
    if ($feePct <= 0) {
      $feePct = (float)($feeRow['fee_pct'] ?? 0.0);
    }
  } catch (Throwable $e) {
    $feePct = 0.0;
  }

  $stmt = $pdo->prepare('
    SELECT e.*, p.name AS participant_name, p.email AS participant_email, p.cpf AS participant_cpf, p.phone AS participant_phone
    FROM workshop_enrollments e
    JOIN workshop_participants p ON p.id = e.participant_id
    WHERE e.workshop_id = ?
      AND e.payment_status = "pendente"
      AND e.amount_due > 0
      AND e.stripe_payment_method_id IS NOT NULL
  ');
  $stmt->execute([$workshopId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $attempted = 0;
  $paid = 0;
  $failed = 0;
  foreach ($rows as $row) {
    $attempted++;
    $clientId = (int)($row['client_id'] ?? 0);
    $pm = $row['stripe_payment_method_id'] ?? '';
    if ($clientId <= 0 || $pm === '') {
      $failed++;
      $upd = $pdo->prepare('UPDATE workshop_enrollments SET payment_failure_message = ? WHERE id = ?');
      $upd->execute(['Cartão ou cliente inválido.', $row['id']]);
      continue;
    }
    try {
      $client = zeefe_stripe_fetch_client($pdo, $clientId);
      $customerId = zeefe_stripe_ensure_customer($pdo, $stripe, $client);
      $amountCents = (int) round(((float)$row['amount_due']) * 100);
      if ($amountCents <= 0) {
        $upd = $pdo->prepare('UPDATE workshop_enrollments SET payment_status = "pago", paid_at = NOW(), stripe_customer_id = :cid WHERE id = :id');
        $upd->execute([':cid' => $customerId, ':id' => $row['id']]);
        $paid++;
        try {
          ledger_insert_workshop_credit($pdo, $workshop, $row, $feePct, date('Y-m-d H:i:s'));
        } catch (Throwable $e) {
          // Ignora falha no ledger
        }
        workshop_send_ticket_email(
          ['name' => $row['participant_name'], 'email' => $row['participant_email']],
          $workshop,
          $row
        );
        continue;
      }

      $intent = $stripe->paymentIntents->create([
        'amount' => $amountCents,
        'currency' => 'brl',
        'customer' => $customerId,
        'payment_method' => $pm,
        'off_session' => true,
        'confirm' => true,
        'metadata' => [
          'context' => 'workshop',
          'workshop_id' => $workshopId,
          'enrollment_id' => $row['id'],
        ],
      ]);

      $chargeId = $intent->charges->data[0]->id ?? null;
      $upd = $pdo->prepare('
        UPDATE workshop_enrollments
        SET payment_status = "pago",
            stripe_customer_id = :cid,
            stripe_payment_intent_id = :pi,
            stripe_charge_id = :charge,
            paid_at = NOW(),
            payment_failure_message = NULL
        WHERE id = :id
      ');
      $upd->execute([
        ':cid' => $customerId,
        ':pi' => $intent->id ?? null,
        ':charge' => $chargeId,
        ':id' => $row['id']
      ]);
      $paid++;
      try {
        ledger_insert_workshop_credit($pdo, $workshop, $row, $feePct, date('Y-m-d H:i:s'));
      } catch (Throwable $e) {
        // Ignora falha no ledger
      }
      workshop_send_ticket_email(
        ['name' => $row['participant_name'], 'email' => $row['participant_email']],
        $workshop,
        $row
      );
    } catch (Throwable $err) {
      $failed++;
      $upd = $pdo->prepare('UPDATE workshop_enrollments SET payment_failure_message = ? WHERE id = ?');
      $upd->execute([substr($err->getMessage(), 0, 240), $row['id']]);
    }
  }

  return ['attempted' => $attempted, 'paid' => $paid, 'failed' => $failed];
}

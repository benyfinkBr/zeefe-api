<?php
require_once __DIR__ . '/../apiconfig.php';
require_once __DIR__ . '/../lib/stripe_helpers.php';
require_once __DIR__ . '/../lib/reservations.php';
require_once __DIR__ . '/../lib/ledger.php';

// Captura pagamentos pendentes de reservas quando a data da política foi atingida.
// Use via cron (ex: a cada hora).

header('Content-Type: application/json');

try {
  zeefe_stripe_ensure_schema($pdo);

  $stmt = $pdo->query(
    "SELECT r.id
     FROM reservations r
     WHERE r.status = 'confirmada'
       AND r.payment_status = 'pendente'
       AND r.policy_charge_at IS NOT NULL
       AND r.policy_charge_at <= NOW()
       AND r.stripe_payment_intent_id IS NOT NULL"
  );
  $ids = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

  if (!$ids) {
    echo json_encode(['success' => true, 'captured' => 0]);
    exit;
  }

  $stripe = zeefe_stripe_client($config);
  $captured = 0;
  $errors = [];

  foreach ($ids as $reservationId) {
    $reservationId = (int)$reservationId;
    $reservation = reservation_load($pdo, $reservationId);
    if (!$reservation) {
      continue;
    }
    $intentId = $reservation['stripe_payment_intent_id'] ?? null;
    if (!$intentId) {
      continue;
    }

    try {
      $capture = $stripe->paymentIntents->capture($intentId, [], [
        'idempotency_key' => 'reservation_capture_' . $reservationId
      ]);

      if ($capture->status !== 'succeeded') {
        throw new RuntimeException('Captura não concluída.');
      }

      $amountCents = $capture->amount_received ?? null;
      if ($amountCents === null) {
        $amountCents = zeefe_stripe_reservation_amount_cents($reservation);
      }
      $amountDecimal = number_format($amountCents / 100, 2, '.', '');
      $chargeId = $capture->latest_charge ?? null;
      $paidAt = null;
      if (!empty($capture->charges) && isset($capture->charges->data[0])) {
        $charge = $capture->charges->data[0];
        $chargeId = $charge->id ?? $chargeId;
        if (isset($charge->created)) {
          $paidAt = normalizeStripePaidAt($charge->created);
        }
      }

      $pdo->beginTransaction();
      $stmtPay = $pdo->prepare('INSERT INTO payments (reservation_id, method, amount, status, transaction_code, paid_at, created_at, updated_at, provider, currency, amount_cents, stripe_payment_intent_id, stripe_charge_id, stripe_customer_id, stripe_payment_method_id, failure_code, failure_message) VALUES (:reservation_id, :method, :amount, :status, :transaction_code, :paid_at, NOW(), NOW(), :provider, :currency, :amount_cents, :pi, :charge, :customer, :pm, NULL, NULL)');
      $stmtPay->execute([
        ':reservation_id' => $reservationId,
        ':method' => 'cartao',
        ':amount' => $amountDecimal,
        ':status' => 'pago',
        ':transaction_code' => $chargeId ?: $intentId,
        ':paid_at' => $paidAt ?? date('Y-m-d H:i:s'),
        ':provider' => 'stripe',
        ':currency' => strtoupper($capture->currency ?? 'BRL'),
        ':amount_cents' => $amountCents,
        ':pi' => $intentId,
        ':charge' => $chargeId,
        ':customer' => $reservation['stripe_customer_id'] ?? null,
        ':pm' => $reservation['stripe_payment_method_id'] ?? null
      ]);

      $stmtUpd = $pdo->prepare('UPDATE reservations SET payment_status = "confirmado", stripe_charge_id = :charge, payment_confirmed_at = :paid_at, hold_expires_at = NULL, updated_at = NOW() WHERE id = :id');
      $stmtUpd->execute([
        ':charge' => $chargeId,
        ':paid_at' => $paidAt ?? date('Y-m-d H:i:s'),
        ':id' => $reservationId
      ]);
      try {
        ledger_insert_reservation_credit($pdo, $reservation, $paidAt ?? date('Y-m-d H:i:s'), $chargeId ?: $intentId);
      } catch (Throwable $e) {
        // Ignora falha no ledger para não interromper o fluxo de pagamento
      }

      $pdo->commit();
      $captured++;
    } catch (Throwable $e) {
      if ($pdo->inTransaction()) {
        $pdo->rollBack();
      }
      $errors[] = ['id' => $reservationId, 'error' => $e->getMessage()];
    }
  }

  echo json_encode(['success' => true, 'captured' => $captured, 'errors' => $errors]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function normalizeStripePaidAt($timestamp): ?string {
  if ($timestamp === null) {
    return null;
  }
  if ($timestamp instanceof DateTimeInterface) {
    return $timestamp->format('Y-m-d H:i:s');
  }
  if (is_numeric($timestamp)) {
    return date('Y-m-d H:i:s', (int)$timestamp);
  }
  return null;
}

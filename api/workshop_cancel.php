<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/workshop_payments.php';
require_once __DIR__ . '/lib/stripe_helpers.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $body = json_decode(file_get_contents('php://input'), true);
  if (!$body) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Requisicao invalida.']);
    exit;
  }

  $workshopId = isset($body['workshop_id']) ? (int)$body['workshop_id'] : 0;
  if ($workshopId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Workshop invalido.']);
    exit;
  }

  $advertiserId = isset($_SESSION['advertiser_id']) ? (int)$_SESSION['advertiser_id'] : 0;
  if ($advertiserId <= 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Nao autorizado.']);
    exit;
  }

  $stmtW = $pdo->prepare('
    SELECT w.*, r.city AS room_city, r.state AS room_state
    FROM workshops w
    JOIN rooms r ON r.id = w.room_id
    WHERE w.id = :id AND w.advertiser_id = :aid
    LIMIT 1
  ');
  $stmtW->execute([':id' => $workshopId, ':aid' => $advertiserId]);
  $workshop = $stmtW->fetch(PDO::FETCH_ASSOC);
  if (!$workshop) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Workshop nao encontrado.']);
    exit;
  }

  if (($workshop['status'] ?? '') === 'cancelado') {
    echo json_encode(['success' => true, 'message' => 'Workshop ja cancelado.']);
    exit;
  }

  if (($workshop['status'] ?? '') === 'concluido') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Workshop ja concluido.']);
    exit;
  }

  $stmtE = $pdo->prepare('
    SELECT e.*, p.name AS participant_name, p.email AS participant_email, p.cpf AS participant_cpf, p.phone AS participant_phone
    FROM workshop_enrollments e
    JOIN workshop_participants p ON p.id = e.participant_id
    WHERE e.workshop_id = :wid AND e.payment_status <> "cancelado"
  ');
  $stmtE->execute([':wid' => $workshopId]);
  $enrollments = $stmtE->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $paidEnrollments = array_filter($enrollments, fn($row) => ($row['payment_status'] ?? '') === 'pago');
  $refunds = 0;
  $refundFails = 0;

  if ($paidEnrollments) {
    zeefe_stripe_ensure_schema($pdo);
    $stripe = zeefe_stripe_client($GLOBALS['config']);
    foreach ($paidEnrollments as $row) {
      $intentId = $row['stripe_payment_intent_id'] ?? null;
      $amountDue = (float)($row['amount_due'] ?? 0);
      try {
        if ($amountDue <= 0) {
          $refunds++;
          continue;
        }
        if (!$intentId) {
          throw new RuntimeException('Pagamento sem ID de Stripe.');
        }
        $stripe->refunds->create([
          'payment_intent' => $intentId
        ], [
          'idempotency_key' => 'workshop_refund_' . $row['id']
        ]);
        $refunds++;
      } catch (Throwable $e) {
        $refundFails++;
        $upd = $pdo->prepare('UPDATE workshop_enrollments SET payment_failure_message = ? WHERE id = ?');
        $upd->execute([substr($e->getMessage(), 0, 240), $row['id']]);
      }
    }
  }

  $updEnroll = $pdo->prepare('UPDATE workshop_enrollments SET payment_status = "cancelado", checkin_status = "cancelado", updated_at = NOW() WHERE workshop_id = ?');
  $updEnroll->execute([$workshopId]);

  $updW = $pdo->prepare('UPDATE workshops SET status = "cancelado", updated_at = NOW() WHERE id = ?');
  $updW->execute([$workshopId]);

  foreach ($enrollments as $row) {
    $amountDue = (float)($row['amount_due'] ?? 0);
    $refundNote = (($row['payment_status'] ?? '') === 'pago' && $amountDue > 0)
      ? 'Seu pagamento sera estornado integralmente.'
      : 'Nenhuma cobranca foi realizada.';
    workshop_send_cancel_email(
      ['name' => $row['participant_name'], 'email' => $row['participant_email']],
      $workshop,
      $refundNote
    );
  }

  echo json_encode([
    'success' => true,
    'refunded' => $refunds,
    'refund_failed' => $refundFails,
    'notified' => count($enrollments)
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

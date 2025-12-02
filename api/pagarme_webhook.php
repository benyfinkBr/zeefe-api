<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/payment_intents.php';
require_once __DIR__ . '/lib/mailer.php';

$authUser = $_SERVER['PHP_AUTH_USER'] ?? '';
$authPass = $_SERVER['PHP_AUTH_PW'] ?? '';
$expectedUser = $config['pagarme']['webhook_user'] ?? '';
$expectedPass = $config['pagarme']['webhook_password'] ?? '';
if ($expectedUser !== '' && $expectedPass !== '') {
  if ($authUser !== $expectedUser || $authPass !== $expectedPass) {
    header('WWW-Authenticate: Basic realm="PagarMe"');
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
  }
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody, true);
if (!$payload) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Payload inválido.']);
  exit;
}

$event = strtolower($payload['type'] ?? $payload['event'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? $data['order'] ?? null;
$metadata = $order['metadata'] ?? $charge['metadata'] ?? [];
$orderId = $order['id'] ?? $payload['data']['id'] ?? null;
$paymentId = $charge['id'] ?? null;
$status = strtolower($charge['status'] ?? '');
$amountCents = (int)($charge['amount'] ?? 0);
$amount = $amountCents > 0 ? $amountCents / 100 : null;

$statusMap = 'pending';
if (str_contains($event, 'paid') || $status === 'paid') {
  $statusMap = 'paid';
} elseif (str_contains($event, 'processing') || $status === 'processing') {
  $statusMap = 'pending';
} elseif (str_contains($event, 'refunded') || str_contains($event, 'canceled') || $status === 'canceled' || $status === 'refunded') {
  $statusMap = 'canceled';
} elseif (str_contains($event, 'failed') || $status === 'failed' || str_contains($event, 'underpaid')) {
  $statusMap = 'failed';
}

payment_intents_update_by_order($pdo, $orderId, $paymentId, [
  'status' => $statusMap,
  'pagarme_payment_id' => $paymentId,
  'last_payload' => $rawBody
]);

$entity = $metadata['entity'] ?? null;
$response = ['success' => true];

try {
  if ($entity === 'reservation' && !empty($metadata['reservation_id'])) {
    $reservationId = (int)$metadata['reservation_id'];
    if ($statusMap === 'paid') {
      $stmt = $pdo->prepare('UPDATE reservations SET payment_status = "confirmado", amount_gross = COALESCE(amount_gross, :amount), updated_at = NOW() WHERE id = :id');
      $stmt->execute([':amount' => $amount, ':id' => $reservationId]);
    } elseif (in_array($statusMap, ['failed','canceled'], true)) {
      $stmt = $pdo->prepare('UPDATE reservations SET payment_status = "pendente", updated_at = NOW() WHERE id = :id');
      $stmt->execute([':id' => $reservationId]);
    }
    $response['reservation_id'] = $reservationId;
  } elseif ($entity === 'workshop' && !empty($metadata['enrollment_id'])) {
    $enrollmentId = (int)$metadata['enrollment_id'];
    if ($statusMap === 'paid') {
      $stmt = $pdo->prepare('UPDATE workshop_enrollments SET payment_status = "pago" WHERE id = :id');
      $stmt->execute([':id' => $enrollmentId]);
    } elseif (in_array($statusMap, ['failed','canceled'], true)) {
      $stmt = $pdo->prepare('UPDATE workshop_enrollments SET payment_status = "pendente" WHERE id = :id');
      $stmt->execute([':id' => $enrollmentId]);
    }
    $response['enrollment_id'] = $enrollmentId;
  }
} catch (Throwable $entityErr) {
  error_log('Erro ao sincronizar entidade após webhook: ' . $entityErr->getMessage());
}

echo json_encode($response);

<?php
/**
 * Isolated Pagar.me webhook endpoint (no sessions/auth).
 * URL: https://zeefe.com.br/webhooks/pagarme.php
 */

$config = include __DIR__ . '/../api/config.php';

try {
    $db = $config['db'];
    $pdo = new PDO(
        "mysql:host={$db['host']};dbname={$db['dbname']};charset={$db['charset']}",
        $db['user'],
        $db['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (Throwable $e) {
    error_log('[PAGARME_WEBHOOK_ISOLATED] DB connection failed: ' . $e->getMessage());
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'ignored' => 'db_connection_error']);
    exit;
}

require_once __DIR__ . '/../api/lib/payment_intents.php';
require_once __DIR__ . '/../api/lib/pagarme_events.php';
require_once __DIR__ . '/../api/lib/reservations.php';
require_once __DIR__ . '/../api/lib/mailer.php';

function pagarmeLog(string $message): void {
    error_log('[PAGARME_WEBHOOK_ISOLATED] ' . $message);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? 'n/a';
$uri = $_SERVER['REQUEST_URI'] ?? '/webhooks/pagarme.php';

if ($method === 'GET') {
    pagarmeLog('Healthcheck from ' . $ip . ' UA=' . $ua);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => true,
        'endpoint' => 'pagarme_webhook_isolated',
        'ts' => date('c')
    ]);
    exit;
}

$raw = file_get_contents('php://input');
pagarmeLog('POST hit ip=' . $ip . ' ua=' . $ua . ' bytes=' . strlen((string) $raw));
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    pagarmeLog('Invalid JSON: ' . json_last_error_msg());
    respondSuccess(['ignored' => 'invalid_json']);
}

$eventType = strtolower($payload['type'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);

if (!$eventType || !is_array($data) || !is_array($charge) || !$order) {
    pagarmeLog('Malformed event type=' . ($eventType ?: 'null'));
    respondSuccess(['ignored' => 'malformed_event']);
}

$metadata = $order['metadata'] ?? $charge['metadata'] ?? [];
$orderId = $order['id'] ?? null;
$paymentId = $charge['id'] ?? null;
$status = strtolower($charge['status'] ?? '');
$amountCents = isset($charge['paid_amount'])
    ? (int) $charge['paid_amount']
    : (isset($charge['amount']) ? (int) $charge['amount'] : 0);
$amount = $amountCents > 0 ? $amountCents / 100 : null;

$statusMap = 'pending';
if (str_contains($eventType, 'paid') || $status === 'paid') {
    $statusMap = 'paid';
} elseif (str_contains($eventType, 'processing') || $status === 'processing') {
    $statusMap = 'pending';
} elseif (str_contains($eventType, 'refunded') || str_contains($eventType, 'canceled') || $status === 'canceled' || $status === 'refunded') {
    $statusMap = 'canceled';
} elseif (str_contains($eventType, 'failed') || $status === 'failed' || str_contains($eventType, 'underpaid')) {
    $statusMap = 'failed';
}

try {
    payment_intents_update_by_order($pdo, $orderId, $paymentId, [
        'status' => $statusMap,
        'pagarme_payment_id' => $paymentId,
        'last_payload' => $raw
    ]);
} catch (Throwable $e) {
    pagarmeLog('payment_intents_update_by_order failed: ' . $e->getMessage());
}

$eventId = null;
try {
    $eventId = pagarme_events_store($pdo, [
        'hook_id' => $payload['id'] ?? null,
        'event_type' => $eventType,
        'status_code' => null,
        'status_text' => $status ?: $statusMap,
        'entity' => $metadata['entity'] ?? null,
        'context_id' => $metadata['reservation_id'] ?? $metadata['enrollment_id'] ?? null,
        'payload' => $raw
    ]);
} catch (Throwable $e) {
    pagarmeLog('pagarme_events_store failed: ' . $e->getMessage());
}

try {
    processBusiness($pdo, $metadata, $charge, $statusMap, $amount);
} catch (Throwable $e) {
    pagarmeLog('Business logic error: ' . $e->getMessage());
}

if ($eventId) {
    pagarme_events_mark_processed($pdo, $eventId, $statusMap, true);
}

respondSuccess();

function processBusiness(PDO $pdo, array $metadata, array $charge, string $statusMap, ?float $amount): void {
    $entity = $metadata['entity'] ?? null;
    if ($entity === 'reservation' && !empty($metadata['reservation_id'])) {
        $reservationId = (int) $metadata['reservation_id'];
        if ($statusMap === 'paid') {
            $fallbackEmail = $charge['customer']['email'] ?? null;
            $stmt = $pdo->prepare('UPDATE reservations SET payment_status = "confirmado", amount_gross = COALESCE(amount_gross, :amount), updated_at = NOW() WHERE id = :id');
            $stmt->execute([':amount' => $amount, ':id' => $reservationId]);
            enviarEmailPagamentoReserva($pdo, $reservationId, $amount, $fallbackEmail);
            enviarEmailDetalhesReservaPosPagamento($pdo, $reservationId, $fallbackEmail);
        } elseif (in_array($statusMap, ['failed', 'canceled'], true)) {
            $fallbackEmail = $charge['customer']['email'] ?? null;
            $stmt = $pdo->prepare('UPDATE reservations SET payment_status = "pendente", updated_at = NOW() WHERE id = :id');
            $stmt->execute([':id' => $reservationId]);
            $reason = $charge['last_transaction']['acquirer_return_message'] ?? ($charge['last_transaction']['status'] ?? $statusMap);
            enviarEmailPagamentoReservaFalhou($pdo, $reservationId, (string) $reason, $fallbackEmail);
            enviarEmailPagamentoReservaFalhouAnunciante($pdo, $reservationId, (string) $reason);
        }
        return;
    }

    if ($entity === 'workshop' && !empty($metadata['enrollment_id'])) {
        $enrollmentId = (int) $metadata['enrollment_id'];
        if ($statusMap === 'paid') {
            $stmt = $pdo->prepare('UPDATE workshop_enrollments SET payment_status = "pago" WHERE id = :id');
            $stmt->execute([':id' => $enrollmentId]);
            enviarEmailPagamentoWorkshop($pdo, $enrollmentId, $amount);
        } elseif (in_array($statusMap, ['failed', 'canceled'], true)) {
            $stmt = $pdo->prepare('UPDATE workshop_enrollments SET payment_status = "pendente" WHERE id = :id');
            $stmt->execute([':id' => $enrollmentId]);
        }
    }
}

function respondSuccess(array $extra = []): void {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(200);
    echo json_encode(array_merge(['success' => true], $extra));
    exit;
}

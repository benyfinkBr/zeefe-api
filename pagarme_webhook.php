<?php
/**
 * Public Pagar.me webhook endpoint (https://zeefe.com.br/pagarme_webhook.php)
 * Standalone: no sessions, no auth, always returns JSON 200.
 */

$config = include __DIR__ . '/api/config.php';

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
    pagarme_log('DB connection failed: ' . $e->getMessage());
    pagarme_respond(['ignored' => 'db_connection_error']);
}

require_once __DIR__ . '/api/lib/payment_intents.php';
require_once __DIR__ . '/api/lib/pagarme_events.php';
require_once __DIR__ . '/api/lib/reservations.php';
require_once __DIR__ . '/api/lib/mailer.php';

function pagarme_log(string $message): void
{
    static $logFile = null;
    if ($logFile === null) {
        $preferred = __DIR__ . '/api/logs';
        if (is_dir($preferred) && is_writable($preferred)) {
            $logFile = $preferred . '/pagarme_webhook.log';
        } else {
            $fallback = __DIR__ . '/logs';
            if (!is_dir($fallback)) {
                @mkdir($fallback, 0755, true);
            }
            $logFile = $fallback . '/pagarme_webhook.log';
        }
    }

    $line = sprintf("[%s] %s\n", date('c'), $message);
    if (@file_put_contents($logFile, $line, FILE_APPEND) === false) {
        error_log('[PAGARME_WEBHOOK_PUBLIC] ' . $message);
    }
}

function pagarme_respond(array $extra = []): void
{
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(200);
    echo json_encode(array_merge(['success' => true], $extra));
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? 'n/a';
$uri = $_SERVER['REQUEST_URI'] ?? '/pagarme_webhook.php';

if ($method === 'GET') {
    pagarme_log('Healthcheck uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua);
    pagarme_respond(['endpoint' => 'pagarme_webhook_public', 'ts' => date('c')]);
}

$raw = file_get_contents('php://input');
pagarme_log('POST hit uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua . ' bytes=' . strlen((string)$raw) . ' body_sample=' . substr((string)$raw, 0, 300));
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    pagarme_log('Invalid JSON: ' . json_last_error_msg());
    pagarme_respond(['ignored' => 'invalid_json']);
}

$eventType = strtolower($payload['type'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);

if (!$eventType || !is_array($data) || !is_array($charge) || !$order) {
    pagarme_log('Malformed event type=' . ($eventType ?: 'null') . ' data_is_array=' . (is_array($data) ? '1' : '0'));
    pagarme_respond(['ignored' => 'malformed_event']);
}

$metadata = $order['metadata'] ?? $charge['metadata'] ?? [];
$orderId = $order['id'] ?? null;
$paymentId = $charge['id'] ?? null;
$status = strtolower($charge['status'] ?? '');
$amountCents = isset($charge['paid_amount'])
    ? (int)$charge['paid_amount']
    : (isset($charge['amount']) ? (int)$charge['amount'] : 0);
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
    pagarme_log('payment_intents_update_by_order error: ' . $e->getMessage());
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
    pagarme_log('pagarme_events_store error: ' . $e->getMessage());
}

try {
    pagarme_handle_business($pdo, $metadata, $charge, $statusMap, $amount);
} catch (Throwable $e) {
    pagarme_log('Business handler error: ' . $e->getMessage());
    if ($eventId) {
        pagarme_events_mark_processed($pdo, $eventId, $e->getMessage(), false);
    }
    pagarme_respond(['error' => 'internal_error']);
}

if ($eventId) {
    pagarme_events_mark_processed($pdo, $eventId, $statusMap, true);
}

pagarme_respond();

function pagarme_handle_business(PDO $pdo, array $metadata, array $charge, string $statusMap, ?float $amount): void
{
    $entity = $metadata['entity'] ?? null;
    if ($entity === 'reservation' && !empty($metadata['reservation_id'])) {
        $reservationId = (int)$metadata['reservation_id'];
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
            enviarEmailPagamentoReservaFalhou($pdo, $reservationId, (string)$reason, $fallbackEmail);
            enviarEmailPagamentoReservaFalhouAnunciante($pdo, $reservationId, (string)$reason);
        }
        return;
    }

    if ($entity === 'workshop' && !empty($metadata['enrollment_id'])) {
        $enrollmentId = (int)$metadata['enrollment_id'];
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

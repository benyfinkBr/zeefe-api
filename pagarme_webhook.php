<?php
<<<<<<< ours
require __DIR__ . '/api/apiconfig.php';
require_once __DIR__ . '/api/lib/pagarme_ingest.php';

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

zeefe_pagarme_set_headers();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET' && isset($_GET['diag'])) {
    echo json_encode(zeefe_pagarme_diag($pdo));
    exit;
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false) {
    $rawBody = '';
}

try {
    zeefe_pagarme_ingest($pdo, $rawBody);
} catch (Throwable $e) {
    error_log('[PAGARME_WEBHOOK_ROOT] ingest error: ' . $e->getMessage());
}

echo '{"success":true}';
=======
/**
 * Public Pagar.me webhook endpoint
 * URL: https://zeefe.com.br/pagarme_webhook.php
 *
 * Quick tests:
 *   curl -i https://zeefe.com.br/pagarme_webhook.php
 *   curl -i -X POST https://zeefe.com.br/pagarme_webhook.php \
 *        -H "Content-Type: application/json" \
 *        --data '{"type":"charge.paid","data":{"charge":{"id":"ch_test","status":"paid","order":{"id":"or_test","metadata":{"entity":"reservation","reservation_id":"51"}}}}}'
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
    pagarmeLog('DB connection failed: ' . $e->getMessage());
    pagarmeRespond(['ignored' => 'db_connection_error']);
}

require_once __DIR__ . '/api/lib/payment_intents.php';
require_once __DIR__ . '/api/lib/pagarme_events.php';
require_once __DIR__ . '/api/lib/reservations.php';
require_once __DIR__ . '/api/lib/mailer.php';

function pagarmeLog(string $message): void
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
            if (is_writable($fallback)) {
                $logFile = $fallback . '/pagarme_webhook.log';
            }
        }
    }

    $line = sprintf("[%s] %s\n", date('c'), $message);
    if (!$logFile || @file_put_contents($logFile, $line, FILE_APPEND) === false) {
        error_log('[PAGARME_WEBHOOK_ROOT] ' . $message);
    }
}

function pagarmeRespond(array $extra = []): void
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

if ($method === 'GET' && isset($_GET['diag'])) {
    try {
        $dbName = $pdo->query('SELECT DATABASE()')->fetchColumn();
        $hostName = $pdo->query('SELECT @@hostname')->fetchColumn();
        $dbUser = $pdo->query('SELECT USER()')->fetchColumn();
        $count = $pdo->query('SELECT COUNT(*) FROM pagarme_events')->fetchColumn();
    } catch (Throwable $e) {
        pagarmeLog('Diag error: ' . $e->getMessage());
        pagarmeRespond(['diag' => ['error' => $e->getMessage()]]);
    }
    pagarmeRespond([
        'diag' => [
            'database' => $dbName,
            'host' => $hostName,
            'user' => $dbUser,
            'pagarme_events_count' => (int)$count
        ]
    ]);
<<<<<<< ours
}

if ($method === 'GET') {
    pagarmeLog('Healthcheck uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua);
    pagarmeRespond(['endpoint' => 'pagarme_webhook_root', 'ts' => date('c')]);
<<<<<<< ours
<<<<<<< ours
=======
>>>>>>> theirs
}

$rawBody = file_get_contents('php://input');
pagarmeLog('POST uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua . ' bytes=' . strlen((string)$rawBody) . ' body_sample=' . substr((string)$rawBody, 0, 300));
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    pagarmeLog('Invalid JSON: ' . json_last_error_msg());
    pagarmeRespond(['ignored' => 'invalid_json']);
<<<<<<< ours
<<<<<<< ours
}

$secret = $config['pagarme']['webhook_secret'] ?? '';
if ($secret !== '') {
    $header = $_SERVER['HTTP_X_HUB_SIGNATURE'] ?? $_SERVER['HTTP_X_PAGARME_SIGNATURE'] ?? '';
    $hash = '';
    if (str_starts_with($header, 'sha1=')) {
        $hash = substr($header, 5);
    } elseif ($header !== '') {
        $hash = $header;
    }
    $expected = hash_hmac('sha1', $rawBody, $secret);
    if (!$hash || !hash_equals($expected, $hash)) {
        pagarmeLog('Invalid signature header=' . $header);
        pagarmeRespond(['ignored' => 'invalid_signature']);
=======

if ($method === 'GET' && isset($_GET['diag'])) {
    try {
        $dbName = $pdo->query('SELECT DATABASE()')->fetchColumn();
        $hostName = $pdo->query('SELECT @@hostname')->fetchColumn();
        $dbUser = $pdo->query('SELECT USER()')->fetchColumn();
        $count = $pdo->query('SELECT COUNT(*) FROM pagarme_events')->fetchColumn();
    } catch (Throwable $e) {
        pagarmeLog('Diag error: ' . $e->getMessage());
        pagarmeRespond(['diag' => ['error' => $e->getMessage()]]);
>>>>>>> theirs
    }
    pagarmeRespond([
        'diag' => [
            'database' => $dbName,
            'host' => $hostName,
            'user' => $dbUser,
            'pagarme_events_count' => (int)$count
        ]
    ]);
}

if ($method === 'GET') {
    pagarmeLog('Healthcheck uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua);
    pagarmeRespond(['endpoint' => 'pagarme_webhook_root', 'ts' => date('c')]);
}

$rawBody = file_get_contents('php://input');
pagarmeLog('POST uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua . ' bytes=' . strlen((string)$rawBody) . ' body_sample=' . substr((string)$rawBody, 0, 300));
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    pagarmeLog('Invalid JSON: ' . json_last_error_msg());
    pagarmeRespond(['ignored' => 'invalid_json']);
}

$secret = $config['pagarme']['webhook_secret'] ?? '';
if ($secret !== '') {
    $header = $_SERVER['HTTP_X_HUB_SIGNATURE'] ?? $_SERVER['HTTP_X_PAGARME_SIGNATURE'] ?? '';
    $hash = '';
    if (str_starts_with($header, 'sha1=')) {
        $hash = substr($header, 5);
    } elseif ($header !== '') {
        $hash = $header;
    }
    $expected = hash_hmac('sha1', $rawBody, $secret);
    if (!$hash || !hash_equals($expected, $hash)) {
        pagarmeLog('Invalid signature header=' . $header);
        pagarmeRespond(['ignored' => 'invalid_signature']);
    }
}

$eventType = strtolower($payload['type'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);

if (!$eventType || !is_array($data) || !is_array($charge) || !$order) {
    pagarmeLog('Malformed event type=' . ($eventType ?: 'null'));
    pagarmeRespond(['ignored' => 'malformed_event']);
}

<<<<<<< ours
$eventType = strtolower($payload['type'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);

if (!$eventType || !is_array($data) || !is_array($charge) || !$order) {
    pagarmeLog('Malformed event type=' . ($eventType ?: 'null'));
    pagarmeRespond(['ignored' => 'malformed_event']);
}

=======
>>>>>>> theirs
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
        'last_payload' => $rawBody
    ]);
} catch (Throwable $e) {
    pagarmeLog('payment_intents_update_by_order error: ' . $e->getMessage());
<<<<<<< ours
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
        'payload' => $rawBody
    ]);
} catch (Throwable $e) {
    pagarmeLog('pagarme_events_store error: ' . $e->getMessage());
}

try {
    pagarmeHandleBusiness($pdo, $metadata, $charge, $statusMap, $amount);
} catch (Throwable $e) {
    pagarmeLog('Business error: ' . $e->getMessage());
    if ($eventId) {
        pagarme_events_mark_processed($pdo, $eventId, $e->getMessage(), false);
    }
    pagarmeRespond(['error' => 'internal_error']);
}

if ($eventId) {
    pagarme_events_mark_processed($pdo, $eventId, $statusMap, true);
}

=======
}

=======
}

$secret = $config['pagarme']['webhook_secret'] ?? '';
if ($secret !== '') {
    $header = $_SERVER['HTTP_X_HUB_SIGNATURE'] ?? $_SERVER['HTTP_X_PAGARME_SIGNATURE'] ?? '';
    $hash = '';
    if (str_starts_with($header, 'sha1=')) {
        $hash = substr($header, 5);
    } elseif ($header !== '') {
        $hash = $header;
    }
    $expected = hash_hmac('sha1', $rawBody, $secret);
    if (!$hash || !hash_equals($expected, $hash)) {
        pagarmeLog('Invalid signature header=' . $header);
        pagarmeRespond(['ignored' => 'invalid_signature']);
    }
}

$eventType = strtolower($payload['type'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);

if (!$eventType || !is_array($data) || !is_array($charge) || !$order) {
    pagarmeLog('Malformed event type=' . ($eventType ?: 'null'));
    pagarmeRespond(['ignored' => 'malformed_event']);
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
        'last_payload' => $rawBody
    ]);
} catch (Throwable $e) {
    pagarmeLog('payment_intents_update_by_order error: ' . $e->getMessage());
}

>>>>>>> theirs
=======
}

$rawBody = file_get_contents('php://input');
pagarmeLog('POST uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua . ' bytes=' . strlen((string)$rawBody) . ' body_sample=' . substr((string)$rawBody, 0, 300));
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    pagarmeLog('Invalid JSON: ' . json_last_error_msg());
    pagarmeRespond(['ignored' => 'invalid_json']);
}

$secret = $config['pagarme']['webhook_secret'] ?? '';
if ($secret !== '') {
    $header = $_SERVER['HTTP_X_HUB_SIGNATURE'] ?? $_SERVER['HTTP_X_PAGARME_SIGNATURE'] ?? '';
    $hash = '';
    if (str_starts_with($header, 'sha1=')) {
        $hash = substr($header, 5);
    } elseif ($header !== '') {
        $hash = $header;
    }
    $expected = hash_hmac('sha1', $rawBody, $secret);
    if (!$hash || !hash_equals($expected, $hash)) {
        pagarmeLog('Invalid signature header=' . $header);
        pagarmeRespond(['ignored' => 'invalid_signature']);
    }
}

$eventType = strtolower($payload['type'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);

if (!$eventType || !is_array($data) || !is_array($charge) || !$order) {
    pagarmeLog('Malformed event type=' . ($eventType ?: 'null'));
    pagarmeRespond(['ignored' => 'malformed_event']);
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
        'last_payload' => $rawBody
    ]);
} catch (Throwable $e) {
    pagarmeLog('payment_intents_update_by_order error: ' . $e->getMessage());
}

>>>>>>> theirs
=======
}

$secret = $config['pagarme']['webhook_secret'] ?? '';
if ($secret !== '') {
    $header = $_SERVER['HTTP_X_HUB_SIGNATURE'] ?? $_SERVER['HTTP_X_PAGARME_SIGNATURE'] ?? '';
    $hash = '';
    if (str_starts_with($header, 'sha1=')) {
        $hash = substr($header, 5);
    } elseif ($header !== '') {
        $hash = $header;
    }
    $expected = hash_hmac('sha1', $rawBody, $secret);
    if (!$hash || !hash_equals($expected, $hash)) {
        pagarmeLog('Invalid signature header=' . $header);
        pagarmeRespond(['ignored' => 'invalid_signature']);
    }
}

$eventType = strtolower($payload['type'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);

if (!$eventType || !is_array($data) || !is_array($charge) || !$order) {
    pagarmeLog('Malformed event type=' . ($eventType ?: 'null'));
    pagarmeRespond(['ignored' => 'malformed_event']);
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
        'last_payload' => $rawBody
    ]);
} catch (Throwable $e) {
    pagarmeLog('payment_intents_update_by_order error: ' . $e->getMessage());
}

>>>>>>> theirs
=======
}

if ($method === 'GET') {
    pagarmeLog('Healthcheck uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua);
    pagarmeRespond(['endpoint' => 'pagarme_webhook_root', 'ts' => date('c')]);
}

$rawBody = file_get_contents('php://input');
pagarmeLog('POST uri=' . $uri . ' ip=' . $ip . ' ua=' . $ua . ' bytes=' . strlen((string)$rawBody) . ' body_sample=' . substr((string)$rawBody, 0, 300));
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    pagarmeLog('Invalid JSON: ' . json_last_error_msg());
    pagarmeRespond(['ignored' => 'invalid_json']);
}

$secret = $config['pagarme']['webhook_secret'] ?? '';
if ($secret !== '') {
    $header = $_SERVER['HTTP_X_HUB_SIGNATURE'] ?? $_SERVER['HTTP_X_PAGARME_SIGNATURE'] ?? '';
    $hash = '';
    if (str_starts_with($header, 'sha1=')) {
        $hash = substr($header, 5);
    } elseif ($header !== '') {
        $hash = $header;
    }
    $expected = hash_hmac('sha1', $rawBody, $secret);
    if (!$hash || !hash_equals($expected, $hash)) {
        pagarmeLog('Invalid signature header=' . $header);
        pagarmeRespond(['ignored' => 'invalid_signature']);
    }
}

$eventType = strtolower($payload['type'] ?? '');
$data = $payload['data'] ?? [];
$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);

if (!$eventType || !is_array($data) || !is_array($charge) || !$order) {
    pagarmeLog('Malformed event type=' . ($eventType ?: 'null'));
    pagarmeRespond(['ignored' => 'malformed_event']);
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
        'last_payload' => $rawBody
    ]);
} catch (Throwable $e) {
    pagarmeLog('payment_intents_update_by_order error: ' . $e->getMessage());
}

>>>>>>> theirs
$eventId = null;
try {
    $eventId = pagarme_events_store($pdo, [
        'hook_id' => $payload['id'] ?? null,
        'event_type' => $eventType,
        'status_code' => null,
        'status_text' => $status ?: $statusMap,
        'entity' => $metadata['entity'] ?? null,
        'context_id' => $metadata['reservation_id'] ?? $metadata['enrollment_id'] ?? null,
        'payload' => $rawBody
    ]);
} catch (Throwable $e) {
    pagarmeLog('pagarme_events_store error: ' . $e->getMessage());
}

try {
    pagarmeHandleBusiness($pdo, $metadata, $charge, $statusMap, $amount);
} catch (Throwable $e) {
    pagarmeLog('Business error: ' . $e->getMessage());
    if ($eventId) {
        pagarme_events_mark_processed($pdo, $eventId, $e->getMessage(), false);
    }
    pagarmeRespond(['error' => 'internal_error']);
}

if ($eventId) {
    pagarme_events_mark_processed($pdo, $eventId, $statusMap, true);
}

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
pagarmeRespond();

function pagarmeHandleBusiness(PDO $pdo, array $metadata, array $charge, string $statusMap, ?float $amount): void
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

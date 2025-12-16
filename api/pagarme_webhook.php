<?php
// Always resolve config relative to this file.
require __DIR__ . '/apiconfig.php';

// Ensure PDO throws exceptions and uses native prepares.
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

// Try to load event helper, but do not fail if missing.
if (file_exists(__DIR__ . '/lib/pagarme_events.php')) {
  require_once __DIR__ . '/lib/pagarme_events.php';
}

function pagarme_webhook_log(string $msg): void {
  error_log('[PAGARME_WEBHOOK] ' . $msg);
}

function store_pagarme_event_fallback(PDO $pdo, array $row): int {
  $stmt = $pdo->prepare(
    'INSERT INTO pagarme_events
      (hook_id, event_type, status_code, status_text, entity, context_id, payload, received_at)
     VALUES
      (:hook_id, :event_type, :status_code, :status_text, :entity, :context_id, :payload, NOW())'
  );
  $stmt->execute([
    ':hook_id' => $row['hook_id'] ?? null,
    ':event_type' => $row['event_type'] ?? '',
    ':status_code' => $row['status_code'] ?? 200,
    ':status_text' => $row['status_text'] ?? '',
    ':entity' => $row['entity'] ?? null,
    ':context_id' => $row['context_id'] ?? null,
    ':payload' => $row['payload'] ?? ''
  ]);
  return (int)$pdo->lastInsertId();
}

// Diagnostics endpoint
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
  $diag = [];
  try {
    $diag['db'] = [
      'name' => $pdo->query('SELECT DATABASE()')->fetchColumn(),
      'user' => $pdo->query('SELECT USER()')->fetchColumn(),
      'host' => $pdo->query('SELECT @@hostname')->fetchColumn()
    ];
    $exists = $pdo->query("SHOW TABLES LIKE 'pagarme_events'")->fetch(PDO::FETCH_NUM);
    $diag['tables'] = ['pagarme_events' => (bool)$exists];
    $diag['count'] = $exists ? (int)$pdo->query('SELECT COUNT(*) FROM pagarme_events')->fetchColumn() : 0;
    $diag['ok'] = true;
  } catch (Throwable $e) {
    $diag = ['ok' => false, 'error' => $e->getMessage()];
  }
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($diag);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'CLI';
$uri = $_SERVER['REQUEST_URI'] ?? '';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rawBody = file_get_contents('php://input');
pagarme_webhook_log("request method={$method} uri={$uri} ip={$ip} body_len=" . strlen((string)$rawBody));

if ($method !== 'POST') {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['success' => true, 'message' => 'only POST accepted, but returning 200']);
  exit;
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['success' => true, 'ignored' => 'invalid_json']);
  exit;
}

$eventType = strtolower((string)($payload['type'] ?? ''));
$hookId = $payload['id'] ?? null;
$data = $payload['data'] ?? [];

$charge = $data['charge'] ?? $data;
$order = $charge['order'] ?? ($data['order'] ?? null);
$metadata = $charge['metadata'] ?? [];
if (is_array($order) && !empty($order['metadata'])) {
  $metadata = array_merge($metadata, (array)$order['metadata']);
}

$status = strtolower((string)($charge['status'] ?? ''));
$contextId = $metadata['reservation_id'] ?? $metadata['enrollment_id'] ?? null;

$storeRow = [
  'hook_id' => $hookId,
  'event_type' => $eventType,
  'status_code' => 200,
  'status_text' => $status ?: $eventType,
  'entity' => $metadata['entity'] ?? null,
  'context_id' => $contextId,
  'payload' => $rawBody,
];

$response = ['success' => true, 'mode' => 'store_only'];

try {
  if (function_exists('pagarme_events_store')) {
    $eventId = pagarme_events_store($pdo, $storeRow);
  } else {
    $eventId = store_pagarme_event_fallback($pdo, $storeRow);
  }
  $response['event_id'] = $eventId;
  pagarme_webhook_log("stored event_id={$eventId}");
} catch (Throwable $e) {
  pagarme_webhook_log('primary store failed: ' . $e->getMessage());
  try {
    $eventId = store_pagarme_event_fallback($pdo, $storeRow);
    $response['event_id'] = $eventId;
    $response['stored_via'] = 'fallback';
  } catch (Throwable $fallbackErr) {
    pagarme_webhook_log('fallback store failed: ' . $fallbackErr->getMessage());
    $response['stored'] = false;
    $response['error'] = $fallbackErr->getMessage();
  }
}

header('Content-Type: application/json; charset=utf-8');
header('X-Zeefe-Webhook-Handler: api/pagarme_webhook.php');
http_response_code(200);
echo json_encode($response);
exit;

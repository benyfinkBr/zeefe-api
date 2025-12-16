<?php
// Ze.EFE — Pagar.me Webhook (STORE-ONLY, bombproof)
// Goal: if the request reaches PHP, write ONE row into `pagarme_events` and always reply HTTP 200.

// Harden runtime: never show errors to the client, always log.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

function _pagarme_diag_log(string $msg): void {
  error_log('[PAGARME_WEBHOOK] ' . $msg);
}

function _respond_ok(array $payload = ['success' => true]): void {
  // Always reply 200 with JSON.
  if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('X-Content-Type-Options: nosniff');
    header('X-Zeefe-Webhook-Handler: api/pagarme_webhook.php');
  }
  http_response_code(200);
  echo json_encode($payload);
  exit;
}

// Prevent apiconfig.php from sending headers or starting sessions when included here.
if (!defined('ZEEFE_NO_GLOBAL_HEADERS')) {
  define('ZEEFE_NO_GLOBAL_HEADERS', true);
}
if (!defined('ZEEFE_NO_SESSION')) {
  define('ZEEFE_NO_SESSION', true);
}

// Load config safely (never hard-fail the webhook on missing includes).
$pdo = $pdo ?? null;
$apiconfigPath = __DIR__ . '/apiconfig.php';
if (file_exists($apiconfigPath)) {
  try {
    require $apiconfigPath;
  } catch (Throwable $e) {
    _pagarme_diag_log('apiconfig require FAILED err=' . $e->getMessage());
  }
} else {
  _pagarme_diag_log('apiconfig missing at ' . $apiconfigPath);
}

// Try to load the event helper if available, but do not hard-fail.
$eventsLibPath = __DIR__ . '/lib/pagarme_events.php';
if (file_exists($eventsLibPath)) {
  try {
    require_once $eventsLibPath;
  } catch (Throwable $e) {
    _pagarme_diag_log('pagarme_events.php require FAILED err=' . $e->getMessage());
  }
}

// Force PDO to throw exceptions so DB errors don't fail silently.
if (isset($pdo) && $pdo instanceof PDO) {
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} else {
  $pdo = null;
}


function pagarme_events_store_fallback(PDO $pdo, array $row): ?int {
  // Minimal insert that does not depend on any other library.
  $stmt = $pdo->prepare(
    'INSERT INTO pagarme_events (hook_id, event_type, status_code, status_text, entity, context_id, payload, received_at) '
    . 'VALUES (:hook_id, :event_type, :status_code, :status_text, :entity, :context_id, :payload, NOW())'
  );
  $stmt->execute([
    ':hook_id' => $row['hook_id'] ?? null,
    ':event_type' => $row['event_type'] ?? null,
    ':status_code' => $row['status_code'] ?? null,
    ':status_text' => $row['status_text'] ?? null,
    ':entity' => $row['entity'] ?? null,
    ':context_id' => $row['context_id'] ?? null,
    ':payload' => $row['payload'] ?? null,
  ]);
  return (int)$pdo->lastInsertId();
}

// Diagnostic mode (GET ?diag=1)
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET' && isset($_GET['diag'])) {
  try {
    if (!$pdo) {
      _respond_ok([
        'ok' => true,
        'pdo' => false,
        'error' => 'pdo_not_initialized',
        'ts' => date('c'),
      ]);
    }

    $db   = $pdo->query('SELECT DATABASE()')->fetchColumn();
    $user = $pdo->query('SELECT USER()')->fetchColumn();
    $host = $pdo->query('SELECT @@hostname')->fetchColumn();
    $hasTable = $pdo->query("SHOW TABLES LIKE 'pagarme_events'")->fetch(PDO::FETCH_NUM);
    $count = $hasTable ? (int)$pdo->query('SELECT COUNT(*) FROM pagarme_events')->fetchColumn() : 0;

    _respond_ok([
      'ok' => true,
      'db' => $db ?: null,
      'user' => $user ?: null,
      'host' => $host ?: null,
      'has_pagarme_events' => (bool)$hasTable,
      'pagarme_events_count' => $count,
      'ts' => date('c'),
    ]);
  } catch (Throwable $e) {
    _pagarme_diag_log('diag FAILED err=' . $e->getMessage());
    _respond_ok(['ok' => false, 'error' => 'diag_failed', 'ts' => date('c')]);
  }
}

// Healthcheck (plain GET without diag)
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
  _respond_ok(['success' => true]);
}

// STORE-ONLY MODE: persist the event and always return 200.
$method = $_SERVER['REQUEST_METHOD'] ?? 'CLI';
$uri = $_SERVER['REQUEST_URI'] ?? '';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

$rawBody = file_get_contents('php://input');
if (!is_string($rawBody)) {
  $rawBody = '';
}

_pagarme_diag_log("hit method={$method} uri={$uri} ip={$ip} ua={$ua} body_len=" . strlen($rawBody));

// Try to parse JSON, but NEVER block storing on parse errors.
$payload = null;
$eventType = 'unknown';
$hookId = null;
$entity = null;
$contextId = null;
$statusText = 'received';

try {
  $decoded = json_decode($rawBody, true);
  if (is_array($decoded)) {
    $payload = $decoded;

    $hookId = $payload['id'] ?? null;
    $eventType = (string)($payload['type'] ?? 'unknown');

    $data = $payload['data'] ?? [];
    $charge = is_array($data) ? ($data['charge'] ?? $data) : [];
    if (!is_array($charge)) $charge = [];

    // Metadata may be in charge.metadata or order.metadata
    $metadata = [];
    $order = $charge['order'] ?? ($data['order'] ?? null);
    if (is_array($charge['metadata'] ?? null)) {
      $metadata = $charge['metadata'];
    }
    if (is_array($order) && is_array($order['metadata'] ?? null)) {
      $metadata = array_merge($metadata, $order['metadata']);
    }

    $entity = isset($metadata['entity']) ? (string)$metadata['entity'] : null;
    $contextId = $metadata['reservation_id'] ?? $metadata['enrollment_id'] ?? null;

    $statusText = (string)($charge['status'] ?? ($data['status'] ?? 'received'));
    if ($statusText === '') $statusText = 'received';
  } else {
    if ($rawBody !== '' && json_last_error() !== JSON_ERROR_NONE) {
      _pagarme_diag_log('json_decode_error=' . json_last_error_msg());
    }
  }
} catch (Throwable $e) {
  _pagarme_diag_log('json_parse_exception=' . $e->getMessage());
}

// Ensure hook_id is never NULL (some schemas require NOT NULL).
if (!$hookId) {
  // If JSON did not parse, create a stable id from body; otherwise a unique one.
  $hookId = $rawBody !== '' ? ('body_' . substr(sha1($rawBody), 0, 24)) : ('body_' . substr(sha1(uniqid('', true)), 0, 24));
}

$storeRow = [
  'hook_id' => $hookId,
  'event_type' => strtolower($eventType),
  'status_code' => 200,
  'status_text' => $statusText,
  'entity' => $entity,
  'context_id' => $contextId,
  'payload' => $rawBody,
];

$eventId = null;
$storedVia = null;

if (!$pdo) {
  _pagarme_diag_log('pdo_not_initialized: cannot store event');
  _respond_ok(['success' => true, 'stored' => false, 'error' => 'pdo_not_initialized']);
}

try {
  if (function_exists('pagarme_events_store')) {
    $eventId = pagarme_events_store($pdo, $storeRow);
    $storedVia = 'helper';
  } else {
    $eventId = pagarme_events_store_fallback($pdo, $storeRow);
    $storedVia = 'fallback';
  }
  _pagarme_diag_log('store ok eventId=' . ($eventId ?: 'null') . ' via=' . ($storedVia ?: 'null') . ' type=' . $storeRow['event_type']);
} catch (Throwable $e) {
  _pagarme_diag_log('store primary FAILED err=' . $e->getMessage());
  // Last resort: try fallback direct insert (even if helper existed but failed)
  try {
    $eventId = pagarme_events_store_fallback($pdo, $storeRow);
    $storedVia = 'fallback_after_fail';
    _pagarme_diag_log('store fallback ok eventId=' . ($eventId ?: 'null'));
  } catch (Throwable $e2) {
    _pagarme_diag_log('store fallback FAILED err=' . $e2->getMessage());
  }
}

// Always reply 200, always minimal body.
if ($eventId) {
  _respond_ok(['success' => true, 'event_id' => (int)$eventId, 'stored_via' => $storedVia]);
}

_respond_ok(['success' => true]);

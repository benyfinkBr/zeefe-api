<?php
if (!defined('ZEEFE_NO_GLOBAL_HEADERS')) {
  define('ZEEFE_NO_GLOBAL_HEADERS', true);
}
if (!defined('ZEEFE_NO_SESSION')) {
  define('ZEEFE_NO_SESSION', true);
}
require __DIR__ . '/../../api/apiconfig.php';
require_once __DIR__ . '/../../api/lib/pagarme_ingest.php';

if ($pdo instanceof PDO) {
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
}

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
  if ($pdo instanceof PDO) {
    zeefe_pagarme_ingest($pdo, $rawBody);
  } else {
    error_log('[PAGARME_WEBHOOK_NEUTRAL] Missing PDO instance');
  }
} catch (Throwable $e) {
  error_log('[PAGARME_WEBHOOK_NEUTRAL] ingest error: ' . $e->getMessage());
}

echo '{"success":true}';

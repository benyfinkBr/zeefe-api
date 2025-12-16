<?php
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

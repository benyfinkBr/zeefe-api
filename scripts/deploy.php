<?php
/**
 * GitHub → cPanel automatic deploy webhook
 * - Triggered by GitHub push to main
 * - Stateless, idempotent, bombproof
 * - Always returns HTTP 200
 */

date_default_timezone_set('America/Sao_Paulo');

/* ================= CONFIG ================= */

$REPO_PATH = '/home/benyfi15/public_html';
$GIT_BIN   = '/usr/local/cpanel/3rdparty/bin/git';
$LOG_FILE  = $REPO_PATH . '/deploy-webhook.log';

/**
 * OPTIONAL: webhook secret (recommended)
 * If you don't want a secret, leave as null
 */
$WEBHOOK_SECRET = null; // e.g. 'my_super_secret_string'

/* ================= EARLY 200 ================= */

http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['status' => 'ok']);
flush();

/* ================= VALIDATE SECRET ================= */

if ($WEBHOOK_SECRET) {
    $headers = getallheaders();
    $signature = $headers['X-Hub-Signature-256'] ?? '';

    $payload = file_get_contents('php://input');
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $WEBHOOK_SECRET);

    if (!hash_equals($hash, $signature)) {
        file_put_contents(
            $LOG_FILE,
            "[DENIED] Invalid signature " . date('Y-m-d H:i:s') . PHP_EOL,
            FILE_APPEND
        );
        exit;
    }
}

/* ================= PARSE EVENT ================= */

$payload = json_decode(file_get_contents('php://input'), true);
$branch  = $payload['ref'] ?? 'unknown';
$sender  = $payload['sender']['login'] ?? 'unknown';

/* ================= DEPLOY ================= */

$cmd = implode(' && ', [
    "cd {$REPO_PATH}",
    "{$GIT_BIN} remote set-url origin https://github.com/benyfinkBr/zeefe-api.git",
    "{$GIT_BIN} fetch origin main",
    "{$GIT_BIN} reset --hard origin/main",
    "{$GIT_BIN} clean -fd"
]);

$output = shell_exec($cmd . ' 2>&1');

/* ================= LOG ================= */

file_put_contents(
    $LOG_FILE,
    "===== DEPLOY =====\n"
    . "Date: " . date('Y-m-d H:i:s') . "\n"
    . "Branch: {$branch}\n"
    . "Sender: {$sender}\n"
    . $output . "\n\n",
    FILE_APPEND
);

exit;

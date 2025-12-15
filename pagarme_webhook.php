<?php
/**
 * Public entrypoint for Pagar.me webhooks.
 * - GET  => healthcheck JSON
 * - POST => routes to real handler under /api/
 *
 * This file must stay extremely small and must not read php://input.
 */

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'CLI';

if ($method === 'GET') {
    $diag = !empty($_GET['diag']);

    $payload = [
        'ok' => true,
        'endpoint' => 'pagarme_webhook_root',
        'ts' => date('c'),
    ];

    if ($diag) {
        $payload['server'] = [
            'ip' => $_SERVER['SERVER_ADDR'] ?? 'unknown',
            'host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
            'uri' => $_SERVER['REQUEST_URI'] ?? '',
        ];
    }

    echo json_encode($payload);
    exit;
}

$handlerPaths = [
    __DIR__ . '/api/pagarme_webhook.php',
    __DIR__ . '/api/api/pagarme_webhook.php',
];

$foundHandler = null;
foreach ($handlerPaths as $candidate) {
    if (is_file($candidate)) {
        $foundHandler = $candidate;
        break;
    }
}

if (!$foundHandler) {
    $message = '[PAGARME_WEBHOOK_ROOT] Handler not found. Tried: ' . implode(', ', $handlerPaths);
    error_log($message);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'handler_not_found',
        'paths_tried' => $handlerPaths,
    ]);
    exit;
}

require $foundHandler;

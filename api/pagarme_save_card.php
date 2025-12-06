<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/pagarme_customers.php';

header('Content-Type: application/json; charset=utf-8');

try {
  if (!isset($_SESSION['client_id'])) {
    throw new RuntimeException('Sessão não autenticada.');
  }

  $input = getJsonInput();
  $clientId = (int)($input['client_id'] ?? 0);
  if ($clientId <= 0 && isset($_SESSION['client_id'])) {
    $clientId = (int) $_SESSION['client_id'];
  }
  $token = trim($input['pagarmetoken'] ?? '');

  if ($clientId <= 0 || $token === '') {
    throw new RuntimeException('Informe client_id e pagarmetoken.');
  }

  if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['client_id']) && (int)$_SESSION['client_id'] !== $clientId) {
    throw new RuntimeException('Sessão inválida para este cliente.');
  }

  $card = saveCardForClient($pdo, $clientId, $token);

  echo json_encode(['success' => true, 'card' => $card]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

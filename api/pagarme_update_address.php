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
  if ($clientId <= 0) {
    throw new RuntimeException('Informe client_id.');
  }

  if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['client_id']) && (int)$_SESSION['client_id'] !== $clientId) {
    throw new RuntimeException('Sessão inválida para este cliente.');
  }

  $result = syncPagarmeAddress($pdo, $clientId, $input);

  echo json_encode([
    'success' => true,
    'address' => $result['address'],
    'customer_id' => $result['customer_id']
  ]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

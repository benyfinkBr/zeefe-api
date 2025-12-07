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
  if ($clientId <= 0) {
    $clientId = (int) $_SESSION['client_id'];
  }
  $cardId = trim($input['card_id'] ?? '');

  if ($clientId <= 0 || $cardId === '') {
    throw new RuntimeException('Informe client_id e card_id.');
  }

  if ((int)$_SESSION['client_id'] !== $clientId) {
    throw new RuntimeException('Sessão inválida para este cliente.');
  }

  $result = deleteCardForClient($pdo, $clientId, $cardId);

  echo json_encode(['success' => true, 'card_id' => $result['card_id']]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $clientId = isset($_GET['client_id']) ? (int) $_GET['client_id'] : 0;
  if ($clientId <= 0) {
    throw new RuntimeException('Informe client_id.');
  }

  $stmtCards = $pdo->prepare('SELECT brand, last4, exp_month, exp_year FROM customer_cards WHERE client_id = ? ORDER BY id DESC');
  $stmtCards->execute([$clientId]);
  $cards = $stmtCards->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $stmtAddr = $pdo->prepare('SELECT street, number, complement, zip_code, city, state, country FROM client_addresses WHERE client_id = ? ORDER BY id DESC LIMIT 1');
  $stmtAddr->execute([$clientId]);
  $address = $stmtAddr->fetch(PDO::FETCH_ASSOC) ?: new stdClass();

  echo json_encode([
    'success' => true,
    'cards' => $cards,
    'address' => $address
  ]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

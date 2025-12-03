<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $clientId = isset($_GET['client_id']) ? (int) $_GET['client_id'] : 0;
  if ($clientId <= 0) {
    throw new RuntimeException('Informe client_id.');
  }

  // Cartões salvos
  $stmt = $pdo->prepare('SELECT id, pagarme_card_id, brand, last4, exp_month, exp_year, holder_name, status, created_at FROM customer_cards WHERE client_id = ? AND status = "active" ORDER BY created_at DESC');
  $stmt->execute([$clientId]);
  $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Endereço (pega o mais recente)
  $stmtAddr = $pdo->prepare('SELECT id, street, number, complement, zip_code, city, state, country FROM client_addresses WHERE client_id = ? ORDER BY updated_at DESC LIMIT 1');
  $stmtAddr->execute([$clientId]);
  $address = $stmtAddr->fetch(PDO::FETCH_ASSOC) ?: null;

  // Perfil básico
  $stmtCli = $pdo->prepare('SELECT id, name, email, cpf, phone, whatsapp FROM clients WHERE id = ? LIMIT 1');
  $stmtCli->execute([$clientId]);
  $client = $stmtCli->fetch(PDO::FETCH_ASSOC) ?: null;

  echo json_encode([
    'success' => true,
    'cards' => $cards,
    'address' => $address,
    'client' => $client
  ]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  if (!isset($_SESSION['client_id'])) {
    echo json_encode(['success' => false, 'error' => 'Sessão não autenticada.']);
    exit;
  }
  $clientId = (int) $_SESSION['client_id'];

  $stmt = $pdo->prepare('SELECT id, name, email, login, cpf, phone, whatsapp, company_id, pagarme_customer_id FROM clients WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $clientId]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    echo json_encode(['success' => false, 'error' => 'Cliente não encontrado.']);
    exit;
  }

  $addrStmt = $pdo->prepare('SELECT street, number, complement, zip_code, city, state, country FROM client_addresses WHERE client_id = :cid ORDER BY updated_at DESC, id DESC LIMIT 1');
  $addrStmt->execute([':cid' => $clientId]);
  $address = $addrStmt->fetch(PDO::FETCH_ASSOC) ?: null;

  echo json_encode([
    'success' => true,
    'client' => [
      'id' => $client['id'],
      'name' => $client['name'],
      'email' => $client['email'],
      'login' => $client['login'],
      'cpf' => $client['cpf'],
      'phone' => $client['phone'] ?? null,
      'whatsapp' => $client['whatsapp'] ?? null,
      'company_id' => $client['company_id'] ?? null,
      'pagarme_customer_id' => $client['pagarme_customer_id'] ?? null,
      'address' => $address
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

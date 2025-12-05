<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/pagarme.php';

header('Content-Type: application/json; charset=utf-8');

function build_pagarme_customer_from_client(array $client): array {
  $document = preg_replace('/\D/', '', $client['cpf'] ?? '');
  $payload = [
    'name' => $client['name'] ?? '',
    'email' => $client['email'] ?? ''
  ];
  if ($document && (strlen($document) === 11 || strlen($document) === 14)) {
    $payload['document'] = $document;
    $payload['type'] = strlen($document) === 11 ? 'individual' : 'company';
  }
  $phone = preg_replace('/\D/', '', $client['phone'] ?? $client['whatsapp'] ?? '');
  if (strlen($phone) >= 10) {
    $payload['phones'] = [
      'mobile_phone' => [
        'country_code' => '55',
        'area_code' => substr($phone, 0, 2),
        'number' => substr($phone, 2)
      ]
    ];
  }
  if (!empty($client['address'])) {
    $addr = $client['address'];
    $payload['address'] = [
      'street' => $addr['street'] ?? '',
      'number' => $addr['number'] ?? '',
      'zip_code' => preg_replace('/\D/', '', $addr['zip_code'] ?? ''),
      'neighborhood' => $addr['neighborhood'] ?? ($addr['city'] ?? ''),
      'city' => $addr['city'] ?? '',
      'state' => $addr['state'] ?? '',
      'country' => $addr['country'] ?? 'BR'
    ];
  }
  return $payload;
}

try {
  $data = json_decode(file_get_contents('php://input'), true);
  if (!$data) {
    throw new RuntimeException('Requisição inválida.');
  }

  $clientId = (int)($data['client_id'] ?? 0);
  $cardToken = trim($data['card_token'] ?? '');
  if ($clientId <= 0 || $cardToken === '') {
    throw new RuntimeException('Informe cliente e card_token.');
  }

  // Carrega cliente
  $stmt = $pdo->prepare('SELECT id, name, email, cpf, phone, whatsapp FROM clients WHERE id = ? LIMIT 1');
  $stmt->execute([$clientId]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    throw new RuntimeException('Cliente não encontrado.');
  }
  // endereço do cliente (mais recente)
  $stmtAddr = $pdo->prepare('SELECT street, number, complement, zip_code, city, state, country FROM client_addresses WHERE client_id = ? ORDER BY updated_at DESC, id DESC LIMIT 1');
  $stmtAddr->execute([$clientId]);
  $client['address'] = $stmtAddr->fetch(PDO::FETCH_ASSOC) ?: [];

  // Busca customer Pagar.me existente em algum cartão
  $stmtCard = $pdo->prepare('SELECT pagarme_customer_id FROM customer_cards WHERE client_id = ? AND pagarme_customer_id IS NOT NULL LIMIT 1');
  $stmtCard->execute([$clientId]);
  $existingCustomerId = $stmtCard->fetchColumn();

  if (!$existingCustomerId) {
    // Cria customer novo
    $customerPayload = build_pagarme_customer_from_client($client);
    $customer = pagarme_request('POST', '/customers', $customerPayload);
    $pagarmeCustomerId = $customer['id'] ?? null;
  } else {
    $pagarmeCustomerId = $existingCustomerId;
  }

  if (!$pagarmeCustomerId) {
    throw new RuntimeException('Não foi possível criar/obter o customer na Pagar.me.');
  }

  // Cria cartão via token
  $payloadCard = ['token' => $cardToken];
  if (!empty($client['address'])) {
    $addr = $client['address'];
    $payloadCard['billing_address'] = [
      'street' => $addr['street'] ?? '',
      'number' => $addr['number'] ?? '',
      'zip_code' => preg_replace('/\D/', '', $addr['zip_code'] ?? ''),
      'neighborhood' => $addr['neighborhood'] ?? ($addr['city'] ?? ''),
      'city' => $addr['city'] ?? '',
      'state' => $addr['state'] ?? '',
      'country' => $addr['country'] ?? 'BR',
      'complement' => $addr['complement'] ?? ''
    ];
  }
  $card = pagarme_request('POST', '/customers/' . $pagarmeCustomerId . '/cards', $payloadCard);

  $pagarmeCardId = $card['id'] ?? null;
  if (!$pagarmeCardId) {
    throw new RuntimeException('Não foi possível registrar o cartão.');
  }

  // Salva no banco
  $stmtInsert = $pdo->prepare("
    INSERT INTO customer_cards (client_id, pagarme_customer_id, pagarme_card_id, brand, last4, exp_month, exp_year, holder_name, status)
    VALUES (:client_id, :customer, :card, :brand, :last4, :exp_month, :exp_year, :holder_name, 'active')
    ON DUPLICATE KEY UPDATE
      brand = VALUES(brand),
      last4 = VALUES(last4),
      exp_month = VALUES(exp_month),
      exp_year = VALUES(exp_year),
      holder_name = VALUES(holder_name),
      status = 'active',
      pagarme_customer_id = VALUES(pagarme_customer_id)
  ");
  $stmtInsert->execute([
    ':client_id' => $clientId,
    ':customer' => $pagarmeCustomerId,
    ':card' => $pagarmeCardId,
    ':brand' => $card['brand'] ?? null,
    ':last4' => $card['last_four_digits'] ?? $card['last_four'] ?? null,
    ':exp_month' => $card['exp_month'] ?? null,
    ':exp_year' => $card['exp_year'] ?? null,
    ':holder_name' => $card['holder_name'] ?? ($client['name'] ?? null),
  ]);

  echo json_encode([
    'success' => true,
    'card_id' => $pagarmeCardId,
    'customer_id' => $pagarmeCustomerId,
    'brand' => $card['brand'] ?? null,
    'last4' => $card['last_four_digits'] ?? $card['last_four'] ?? null
  ]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

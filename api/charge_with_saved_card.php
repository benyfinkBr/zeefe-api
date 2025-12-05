<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/pagarme.php';

header('Content-Type: application/json; charset=utf-8');

function build_customer_payload_from_client(array $client): array {
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
  $cardLocalId = (int)($data['card_local_id'] ?? 0); // id da tabela customer_cards
  $amountCents = (int)($data['amount_cents'] ?? 0);
  $description = trim($data['description'] ?? 'Pagamento Ze.EFE');
  $metadata = $data['metadata'] ?? [];

  if ($clientId <= 0 || $cardLocalId <= 0 || $amountCents <= 0) {
    throw new RuntimeException('Informe cliente, cartão salvo e valor.');
  }

  // Carrega cliente
  $stmt = $pdo->prepare('SELECT id, name, email, cpf, phone, whatsapp FROM clients WHERE id = ? LIMIT 1');
  $stmt->execute([$clientId]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    throw new RuntimeException('Cliente não encontrado.');
  }
  // endereço do cliente
  $stmtAddr = $pdo->prepare('SELECT street, number, complement, zip_code, city, state, country FROM client_addresses WHERE client_id = ? ORDER BY updated_at DESC, id DESC LIMIT 1');
  $stmtAddr->execute([$clientId]);
  $client['address'] = $stmtAddr->fetch(PDO::FETCH_ASSOC) ?: [];

  // Carrega cartão salvo
  $stmtCard = $pdo->prepare('SELECT * FROM customer_cards WHERE id = ? AND client_id = ? AND status = \"active\" LIMIT 1');
  $stmtCard->execute([$cardLocalId, $clientId]);
  $card = $stmtCard->fetch(PDO::FETCH_ASSOC);
  if (!$card) {
    throw new RuntimeException('Cartão salvo não encontrado ou inativo.');
  }

  $pagarmeCardId = $card['pagarme_card_id'];
  $pagarmeCustomerId = $card['pagarme_customer_id'];

  // Garante customer_id
  if (!$pagarmeCustomerId) {
    $customerPayload = build_customer_payload_from_client($client);
    $customer = pagarme_request('POST', '/customers', $customerPayload);
    $pagarmeCustomerId = $customer['id'] ?? null;
    if ($pagarmeCustomerId) {
      $pdo->prepare('UPDATE customer_cards SET pagarme_customer_id = :cid WHERE id = :id')->execute([
        ':cid' => $pagarmeCustomerId,
        ':id' => $cardLocalId
      ]);
    }
  }

  if (!$pagarmeCustomerId) {
    throw new RuntimeException('Não foi possível obter o customer na Pagar.me.');
  }

  // Monta pedido com cobrança no cartão salvo
  $payload = [
    'code' => $data['code'] ?? ('charge_' . uniqid()),
    'items' => [[
      'amount' => $amountCents,
      'description' => $description,
      'quantity' => 1,
      'code' => $data['item_code'] ?? 'item'
    ]],
    'customer' => ['id' => $pagarmeCustomerId],
    'payments' => [[
      'payment_method' => 'credit_card',
      'amount' => $amountCents,
      'credit_card' => [
        'card_id' => $pagarmeCardId,
        'capture' => true
      ]
    ]],
    'metadata' => $metadata
  ];

  $order = pagarme_request('POST', '/orders', $payload);

  echo json_encode([
    'success' => true,
    'order_id' => $order['id'] ?? null,
    'charge_status' => $order['charges'][0]['status'] ?? null,
    'charge_id' => $order['charges'][0]['id'] ?? null
  ]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

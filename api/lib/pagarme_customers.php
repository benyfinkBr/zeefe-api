<?php
require_once __DIR__ . '/pagarme.php';
require_once __DIR__ . '/db_schema.php';

function ensurePagarmeColumns(PDO $pdo): void {
  try {
    ensureColumn($pdo, 'clients', 'pagarme_customer_id', 'VARCHAR(80) NULL', 'company_role');
  } catch (Throwable $e) {
    error_log('[Pagarme] Não foi possível garantir coluna clients.pagarme_customer_id: ' . $e->getMessage());
  }
  try {
    ensureColumn($pdo, 'customer_cards', 'fingerprint', 'VARCHAR(128) NULL', 'pagarme_card_id');
  } catch (Throwable $e) {
    error_log('[Pagarme] Não foi possível garantir coluna customer_cards.fingerprint: ' . $e->getMessage());
  }
}

function fetchClientWithAddress(PDO $pdo, int $clientId): array {
  $stmt = $pdo->prepare('SELECT id, name, email, cpf, phone, whatsapp, pagarme_customer_id FROM clients WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $clientId]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

  $addrStmt = $pdo->prepare('SELECT street, number, complement, zip_code, city, state, country FROM client_addresses WHERE client_id = :id ORDER BY updated_at DESC, id DESC LIMIT 1');
  $addrStmt->execute([':id' => $clientId]);
  $address = $addrStmt->fetch(PDO::FETCH_ASSOC) ?: [];

  return [$client, $address];
}

function buildPhonePayload(?string $digits): ?array {
  $clean = preg_replace('/\D/', '', (string)$digits);
  if (strlen($clean) < 10) {
    return null;
  }
  return [
    'country_code' => '55',
    'area_code' => substr($clean, 0, 2),
    'number' => substr($clean, 2)
  ];
}

function buildCustomerPayload(array $client, array $address): array {
  $cpf = preg_replace('/\D/', '', $client['cpf'] ?? '');
  $phoneDigits = $client['phone'] ?: ($client['whatsapp'] ?? '');
  $mobile = buildPhonePayload($phoneDigits);

  $payload = [
    'name' => $client['name'] ?? '',
    'email' => $client['email'] ?? '',
    'type' => (strlen($cpf) === 14) ? 'company' : 'individual',
    'document' => $cpf ?: null
  ];
  if ($mobile) {
    $payload['phones'] = ['mobile_phone' => $mobile];
  }
  if (!empty($address)) {
    $payload['address'] = [
      'street' => $address['street'] ?? '',
      'number' => $address['number'] ?? '',
      'zip_code' => preg_replace('/\D/', '', $address['zip_code'] ?? ''),
      'city' => $address['city'] ?? '',
      'state' => $address['state'] ?? '',
      'country' => $address['country'] ?? 'BR'
    ];
  }

  return $payload;
}

function ensurePagarmeCustomer(PDO $pdo, int $clientId): array {
  ensurePagarmeColumns($pdo);
  [$client, $address] = fetchClientWithAddress($pdo, $clientId);
  if (!$client) {
    throw new RuntimeException('Cliente não encontrado.');
  }

  $existingId = $client['pagarme_customer_id'] ?? null;
  if ($existingId) {
    return ['id' => $existingId, 'created' => false];
  }

  $payload = buildCustomerPayload($client, $address);
  $customer = pagarme_request('POST', '/customers', $payload);
  $customerId = $customer['id'] ?? null;
  if (!$customerId) {
    throw new RuntimeException('Pagar.me não retornou o ID do customer.');
  }

  $upd = $pdo->prepare('UPDATE clients SET pagarme_customer_id = :cid, updated_at = NOW() WHERE id = :id');
  $upd->execute([':cid' => $customerId, ':id' => $clientId]);

  return ['id' => $customerId, 'created' => true, 'customer' => $customer];
}

function upsertClientAddress(PDO $pdo, int $clientId, array $address): array {
  $clean = [
    'street' => trim($address['street'] ?? ''),
    'number' => trim($address['number'] ?? ''),
    'complement' => trim($address['complement'] ?? ''),
    'zip_code' => preg_replace('/\D/', '', $address['zip_code'] ?? ''),
    'city' => trim($address['city'] ?? ''),
    'state' => trim($address['state'] ?? ''),
    'country' => trim($address['country'] ?? 'BR')
  ];

  $stmt = $pdo->prepare('SELECT id FROM client_addresses WHERE client_id = :id ORDER BY updated_at DESC, id DESC LIMIT 1');
  $stmt->execute([':id' => $clientId]);
  $addrId = $stmt->fetchColumn();

  if ($addrId) {
    $upd = $pdo->prepare('UPDATE client_addresses SET street = :street, number = :number, complement = :complement, zip_code = :zip_code, city = :city, state = :state, country = :country, updated_at = NOW() WHERE id = :id');
    $upd->execute([
      ':street' => $clean['street'],
      ':number' => $clean['number'],
      ':complement' => $clean['complement'],
      ':zip_code' => $clean['zip_code'],
      ':city' => $clean['city'],
      ':state' => $clean['state'],
      ':country' => $clean['country'],
      ':id' => $addrId
    ]);
  } else {
    $ins = $pdo->prepare('INSERT INTO client_addresses (client_id, street, number, complement, zip_code, city, state, country, created_at, updated_at) VALUES (:client_id, :street, :number, :complement, :zip_code, :city, :state, :country, NOW(), NOW())');
    $ins->execute([
      ':client_id' => $clientId,
      ':street' => $clean['street'],
      ':number' => $clean['number'],
      ':complement' => $clean['complement'],
      ':zip_code' => $clean['zip_code'],
      ':city' => $clean['city'],
      ':state' => $clean['state'],
      ':country' => $clean['country']
    ]);
  }

  return $clean;
}

function syncPagarmeAddress(PDO $pdo, int $clientId, array $address): array {
  $addressClean = upsertClientAddress($pdo, $clientId, $address);
  $customer = ensurePagarmeCustomer($pdo, $clientId);
  $customerId = $customer['id'];

  $addrPayload = [
    'line_1' => trim(($addressClean['street'] ?? '') . ', ' . ($addressClean['number'] ?? '')),
    'line_2' => $addressClean['complement'] ?? '',
    'zip_code' => preg_replace('/\D/', '', $addressClean['zip_code'] ?? ''),
    'city' => $addressClean['city'] ?? '',
    'state' => strtoupper($addressClean['state'] ?? ''),
    'country' => strtoupper($addressClean['country'] ?? 'BR')
  ];
  // Envia endereço apenas se os campos-chave estiverem presentes para evitar 422
  $hasAddress =
    !empty($addressClean['street'] ?? '') &&
    !empty($addressClean['number'] ?? '') &&
    strlen($addrPayload['zip_code']) >= 8 &&
    !empty($addrPayload['city']) &&
    !empty($addrPayload['state']);

  $payload = [];
  if ($hasAddress) {
    $payload['address'] = $addrPayload;
  }

  $resp = $payload ? pagarme_request('PUT', '/customers/' . $customerId, $payload) : [];
  if (!empty($payload['address'])) {
    try {
      pagarme_request('POST', "/customers/{$customerId}/addresses", [
        'line_1' => $payload['address']['line_1'] ?? '',
        'line_2' => $payload['address']['line_2'] ?? '',
        'zip_code' => $payload['address']['zip_code'],
        'city' => $payload['address']['city'],
        'state' => $payload['address']['state'],
        'country' => $payload['address']['country'],
        'type' => 'billing'
      ]);
    } catch (Throwable $e) {
      error_log('[Pagarme] Falha ao registrar endereço na lista do customer: ' . $e->getMessage());
    }
  }
  return ['address' => $addressClean, 'customer_id' => $customerId, 'pagarme_response' => $resp];
}

function updatePagarmeCustomer(PDO $pdo, int $clientId, array $clientData, array $address): array {
  $customer = ensurePagarmeCustomer($pdo, $clientId);
  $customerId = $customer['id'];

  $cpf = preg_replace('/\D/', '', $clientData['cpf'] ?? '');
  $phoneDigits = $clientData['phone'] ?? ($clientData['whatsapp'] ?? null);
  $mobile = buildPhonePayload($phoneDigits);

  $payload = [
    'name' => $clientData['name'] ?? null,
    'email' => $clientData['email'] ?? null
  ];
  if ($cpf && (strlen($cpf) === 11 || strlen($cpf) === 14)) {
    $payload['type'] = (strlen($cpf) === 14) ? 'company' : 'individual';
    $payload['document'] = $cpf;
  }
  if ($mobile) {
    $payload['phones'] = ['mobile_phone' => $mobile];
  }
  if (!empty($address)) {
    $addrPayload = [
      'line_1' => trim(($address['street'] ?? '') . ', ' . ($address['number'] ?? '')),
      'line_2' => $address['complement'] ?? '',
      'zip_code' => preg_replace('/\D/', '', $address['zip_code'] ?? ''),
      'city' => $address['city'] ?? '',
      'state' => strtoupper($address['state'] ?? ''),
      'country' => strtoupper($address['country'] ?? 'BR')
    ];
    $hasAddress =
      !empty($address['street'] ?? '') &&
      !empty($address['number'] ?? '') &&
      strlen($addrPayload['zip_code']) >= 8 &&
      !empty($addrPayload['city']) &&
      !empty($addrPayload['state']);
    if ($hasAddress) {
      $payload['address'] = $addrPayload;
    }
  }

  // remove chaves nulas ou vazias
  $payload = array_filter($payload, function ($v) {
    if (is_array($v)) return true;
    return $v !== null && $v !== '';
  });

  $resp = $payload ? pagarme_request('PUT', '/customers/' . $customerId, $payload) : [];

  // Cria/atualiza endereço de cobrança na lista de endereços do customer para refletir no dashboard
  if (!empty($payload['address'])) {
    try {
      pagarme_request('POST', "/customers/{$customerId}/addresses", [
        'line_1' => $payload['address']['line_1'] ?? '',
        'line_2' => $payload['address']['line_2'] ?? '',
        'zip_code' => $payload['address']['zip_code'],
        'city' => $payload['address']['city'],
        'state' => $payload['address']['state'],
        'country' => $payload['address']['country'],
        'type' => 'billing'
      ]);
    } catch (Throwable $e) {
      // não bloqueia fluxo
      error_log('[Pagarme] Falha ao registrar endereço na lista do customer: ' . $e->getMessage());
    }
  }

  return ['customer_id' => $customerId, 'pagarme_response' => $resp];
}

function saveCardForClient(PDO $pdo, int $clientId, string $token): array {
  ensurePagarmeColumns($pdo);
  [$client, $address] = fetchClientWithAddress($pdo, $clientId);
  $customer = ensurePagarmeCustomer($pdo, $clientId);
  $customerId = $customer['id'];

  $payload = ['token' => $token];
  if (!empty($address)) {
    $payload['billing_address'] = [
      'line_1'   => trim(($address['street'] ?? '') . ' ' . ($address['number'] ?? '')),
      'line_2'   => $address['complement'] ?? '',
      'zip_code' => preg_replace('/\D/', '', $address['zip_code'] ?? ''),
      'city'     => $address['city'] ?? '',
      'state'    => $address['state'] ?? '',
      'country'  => $address['country'] ?? 'BR',
    ];
  }

  $card = pagarme_request('POST', "/customers/{$customerId}/cards", $payload);

  $cardId = $card['id'] ?? null;
  if (!$cardId) {
    throw new RuntimeException('Pagar.me não retornou o ID do cartão.');
  }
  $brand = $card['brand'] ?? null;
  $last4 = $card['last_four_digits'] ?? ($card['last4'] ?? null);
  $expMonth = $card['exp_month'] ?? $card['expiration_month'] ?? null;
  $expYear = $card['exp_year'] ?? $card['expiration_year'] ?? null;
  $holder = $card['holder_name'] ?? null;
  $fingerprint = $card['fingerprint'] ?? null;

  $stmtCheck = $pdo->prepare('SELECT id FROM customer_cards WHERE pagarme_card_id = :cid LIMIT 1');
  $stmtCheck->execute([':cid' => $cardId]);
  $existingId = $stmtCheck->fetchColumn();

  if ($existingId) {
    $upd = $pdo->prepare('UPDATE customer_cards SET brand = :brand, last4 = :last4, exp_month = :exp_month, exp_year = :exp_year, holder_name = :holder, fingerprint = :fingerprint, updated_at = NOW(), status = "active", pagarme_customer_id = :customer WHERE id = :id');
    $upd->execute([
      ':brand' => $brand,
      ':last4' => $last4,
      ':exp_month' => $expMonth,
      ':exp_year' => $expYear,
      ':holder' => $holder,
      ':fingerprint' => $fingerprint,
      ':customer' => $customerId,
      ':id' => $existingId
    ]);
  } else {
    $ins = $pdo->prepare('INSERT INTO customer_cards (client_id, pagarme_customer_id, pagarme_card_id, brand, last4, exp_month, exp_year, holder_name, fingerprint, status, created_at, updated_at) VALUES (:client_id, :customer_id, :card_id, :brand, :last4, :exp_month, :exp_year, :holder, :fingerprint, "active", NOW(), NOW())');
    $ins->execute([
      ':client_id' => $clientId,
      ':customer_id' => $customerId,
      ':card_id' => $cardId,
      ':brand' => $brand,
      ':last4' => $last4,
      ':exp_month' => $expMonth,
      ':exp_year' => $expYear,
      ':holder' => $holder,
      ':fingerprint' => $fingerprint
    ]);
  }

  return [
    'card_id' => $cardId,
    'brand' => $brand,
    'last4' => $last4,
    'exp_month' => $expMonth,
    'exp_year' => $expYear,
    'holder_name' => $holder,
    'fingerprint' => $fingerprint,
    'customer_id' => $customerId
  ];
}

function listCardsForClient(PDO $pdo, int $clientId): array {
  ensurePagarmeColumns($pdo);
  [$client, ] = fetchClientWithAddress($pdo, $clientId);
  if (!$client) {
    throw new RuntimeException('Cliente não encontrado.');
  }

  $customerId = $client['pagarme_customer_id'] ?? null;
  if (!$customerId) {
    $customer = ensurePagarmeCustomer($pdo, $clientId);
    $customerId = $customer['id'];
  }

  $resp = pagarme_request('GET', "/customers/{$customerId}/cards");
  $cards = $resp['data'] ?? $resp ?? [];
  if (!is_array($cards)) {
    $cards = [];
  }

  $normalized = [];
  foreach ($cards as $card) {
    $normalized[] = [
      'card_id' => $card['id'] ?? null,
      'brand' => $card['brand'] ?? null,
      'last4' => $card['last_four_digits'] ?? ($card['last4'] ?? null),
      'exp_month' => $card['exp_month'] ?? $card['expiration_month'] ?? null,
      'exp_year' => $card['exp_year'] ?? $card['expiration_year'] ?? null,
      'holder_name' => $card['holder_name'] ?? null,
      'fingerprint' => $card['fingerprint'] ?? null
    ];
  }

  // Sincroniza com o banco local (upsert por pagarme_card_id)
  foreach ($normalized as $card) {
    if (empty($card['card_id'])) {
      continue;
    }
    $check = $pdo->prepare('SELECT id FROM customer_cards WHERE pagarme_card_id = :cid LIMIT 1');
    $check->execute([':cid' => $card['card_id']]);
    $exists = $check->fetchColumn();
    if ($exists) {
      $upd = $pdo->prepare('UPDATE customer_cards SET brand = :brand, last4 = :last4, exp_month = :exp_month, exp_year = :exp_year, holder_name = :holder, fingerprint = :fingerprint, updated_at = NOW(), status = "active", pagarme_customer_id = :customer WHERE id = :id');
      $upd->execute([
        ':brand' => $card['brand'],
        ':last4' => $card['last4'],
        ':exp_month' => $card['exp_month'],
        ':exp_year' => $card['exp_year'],
        ':holder' => $card['holder_name'],
        ':fingerprint' => $card['fingerprint'],
        ':customer' => $customerId,
        ':id' => $exists
      ]);
    } else {
      $ins = $pdo->prepare('INSERT INTO customer_cards (client_id, pagarme_customer_id, pagarme_card_id, brand, last4, exp_month, exp_year, holder_name, fingerprint, status, created_at, updated_at) VALUES (:client_id, :customer_id, :card_id, :brand, :last4, :exp_month, :exp_year, :holder, :fingerprint, "active", NOW(), NOW())');
      $ins->execute([
        ':client_id' => $clientId,
        ':customer_id' => $customerId,
        ':card_id' => $card['card_id'],
        ':brand' => $card['brand'],
        ':last4' => $card['last4'],
        ':exp_month' => $card['exp_month'],
        ':exp_year' => $card['exp_year'],
        ':holder' => $card['holder_name'],
        ':fingerprint' => $card['fingerprint']
      ]);
    }
  }

  return ['cards' => $normalized, 'customer_id' => $customerId];
}

function deleteCardForClient(PDO $pdo, int $clientId, string $cardId): array {
  if ($cardId === '') {
    throw new RuntimeException('Informe o card_id.');
  }
  ensurePagarmeColumns($pdo);
  $customer = ensurePagarmeCustomer($pdo, $clientId);
  $customerId = $customer['id'];

  pagarme_request('DELETE', "/customers/{$customerId}/cards/{$cardId}");

  $upd = $pdo->prepare('UPDATE customer_cards SET status = "inactive", updated_at = NOW() WHERE client_id = :cid AND pagarme_card_id = :card');
  $upd->execute([':cid' => $clientId, ':card' => $cardId]);

  return ['success' => true, 'customer_id' => $customerId, 'card_id' => $cardId];
}

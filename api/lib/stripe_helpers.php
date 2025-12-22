<?php
declare(strict_types=1);

use Stripe\StripeClient;

function zeefe_stripe_autoload(): void {
  static $loaded = false;
  if ($loaded) {
    return;
  }
  $autoload = __DIR__ . '/../../vendor/autoload.php';
  if (!file_exists($autoload)) {
    throw new RuntimeException('Stripe SDK não encontrado. Rode composer install no servidor.');
  }
  require_once $autoload;
  $loaded = true;
}

function zeefe_stripe_config(array $config): array {
  $stripe = $config['stripe'] ?? null;
  if (!$stripe || empty($stripe['secret_key'])) {
    throw new RuntimeException('Stripe não configurado. Defina STRIPE_SECRET_KEY no ambiente.');
  }
  return $stripe;
}

function zeefe_stripe_client(array $config): StripeClient {
  $stripeConfig = zeefe_stripe_config($config);
  zeefe_stripe_autoload();
  return new StripeClient($stripeConfig['secret_key']);
}

function zeefe_stripe_column_exists(PDO $pdo, string $table, string $column): bool {
  $stmt = $pdo->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
  $stmt->execute([':column' => $column]);
  return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
}

function zeefe_stripe_index_exists(PDO $pdo, string $table, string $indexName): bool {
  $stmt = $pdo->prepare("SHOW INDEX FROM `{$table}` WHERE Key_name = :name");
  $stmt->execute([':name' => $indexName]);
  return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
}

function zeefe_stripe_ensure_schema(PDO $pdo): void {
  static $ensured = false;
  if ($ensured) {
    return;
  }

  try {
    if (!zeefe_stripe_column_exists($pdo, 'clients', 'stripe_customer_id')) {
      $pdo->exec("ALTER TABLE `clients` ADD COLUMN `stripe_customer_id` varchar(80) NULL AFTER `company_role`");
    }
  } catch (Throwable $e) {
    error_log('[Stripe] Falha ao garantir coluna clients.stripe_customer_id: ' . $e->getMessage());
  }

  try {
    if (!zeefe_stripe_column_exists($pdo, 'customer_cards', 'stripe_customer_id')) {
      $pdo->exec("ALTER TABLE `customer_cards` ADD COLUMN `stripe_customer_id` varchar(80) NULL AFTER `client_id`");
    }
  } catch (Throwable $e) {
    error_log('[Stripe] Falha ao garantir coluna customer_cards.stripe_customer_id: ' . $e->getMessage());
  }

  try {
    if (!zeefe_stripe_column_exists($pdo, 'customer_cards', 'stripe_payment_method_id')) {
      $pdo->exec("ALTER TABLE `customer_cards` ADD COLUMN `stripe_payment_method_id` varchar(80) NULL AFTER `stripe_customer_id`");
    }
  } catch (Throwable $e) {
    error_log('[Stripe] Falha ao garantir coluna customer_cards.stripe_payment_method_id: ' . $e->getMessage());
  }

  try {
    if (!zeefe_stripe_index_exists($pdo, 'customer_cards', 'uniq_stripe_payment_method')) {
      $pdo->exec("ALTER TABLE `customer_cards` ADD UNIQUE KEY `uniq_stripe_payment_method` (`stripe_payment_method_id`)");
    }
  } catch (Throwable $e) {
    error_log('[Stripe] Falha ao garantir índice em customer_cards.stripe_payment_method_id: ' . $e->getMessage());
  }

  $ensured = true;
}

function zeefe_stripe_fetch_client(PDO $pdo, int $clientId): array {
  zeefe_stripe_ensure_schema($pdo);
  $stmt = $pdo->prepare('SELECT id, name, email, phone, whatsapp, stripe_customer_id FROM clients WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $clientId]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    throw new RuntimeException('Cliente não encontrado.');
  }
  return $client;
}

function zeefe_stripe_ensure_customer(PDO $pdo, StripeClient $stripe, array $client): string {
  if (!empty($client['stripe_customer_id'])) {
    return $client['stripe_customer_id'];
  }

  $payload = [
    'name' => $client['name'] ?? null,
    'email' => $client['email'] ?? null,
    'metadata' => [
      'zeefe_client_id' => $client['id']
    ]
  ];

  $customer = $stripe->customers->create($payload);
  $customerId = $customer->id ?? null;
  if (!$customerId) {
    throw new RuntimeException('Stripe não retornou o ID do cliente.');
  }

  $stmt = $pdo->prepare('UPDATE clients SET stripe_customer_id = :cid, updated_at = NOW() WHERE id = :id');
  $stmt->execute([':cid' => $customerId, ':id' => $client['id']]);

  return $customerId;
}

function zeefe_stripe_upsert_card(PDO $pdo, int $clientId, string $stripeCustomerId, array $cardData): array {
  zeefe_stripe_ensure_schema($pdo);
  $stmt = $pdo->prepare('SELECT id FROM customer_cards WHERE stripe_payment_method_id = :pm LIMIT 1');
  $stmt->execute([':pm' => $cardData['payment_method_id']]);
  $cardId = $stmt->fetchColumn();

  $payload = [
    ':client_id' => $clientId,
    ':stripe_customer_id' => $stripeCustomerId,
    ':pm' => $cardData['payment_method_id'],
    ':brand' => $cardData['brand'] ?? null,
    ':last4' => $cardData['last4'] ?? null,
    ':exp_month' => $cardData['exp_month'] ?? null,
    ':exp_year' => $cardData['exp_year'] ?? null,
    ':holder' => $cardData['holder'] ?? null,
    ':fingerprint' => $cardData['fingerprint'] ?? null
  ];

  if ($cardId) {
    $sql = 'UPDATE customer_cards SET stripe_customer_id = :stripe_customer_id, brand = :brand, last4 = :last4, exp_month = :exp_month, exp_year = :exp_year, holder_name = :holder, fingerprint = :fingerprint, status = "active", updated_at = NOW() WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($payload + [':id' => $cardId]);
  } else {
    $sql = 'INSERT INTO customer_cards (client_id, stripe_customer_id, stripe_payment_method_id, brand, last4, exp_month, exp_year, holder_name, fingerprint, status, created_at, updated_at) VALUES (:client_id, :stripe_customer_id, :pm, :brand, :last4, :exp_month, :exp_year, :holder, :fingerprint, "active", NOW(), NOW())';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($payload);
    $cardId = (int)$pdo->lastInsertId();
  }

  return [
    'id' => (int)$cardId,
    'brand' => $cardData['brand'] ?? null,
    'last4' => $cardData['last4'] ?? null,
    'exp_month' => (int)($cardData['exp_month'] ?? 0),
    'exp_year' => (int)($cardData['exp_year'] ?? 0),
    'holder_name' => $cardData['holder'] ?? null,
    'payment_method_id' => $cardData['payment_method_id']
  ];
}

function zeefe_stripe_format_phone(?string $number): ?string {
  if (!$number) {
    return null;
  }
  $digits = preg_replace('/\D+/', '', $number);
  if (!$digits) {
    return null;
  }
  if (strpos($digits, '55') !== 0) {
    $digits = '55' . $digits;
  }
  return '+' . $digits;
}

function zeefe_stripe_address_payload(array $address): array {
  $line1 = trim(($address['street'] ?? '') . ' ' . ($address['number'] ?? ''));
  $payload = array_filter([
    'line1' => $line1 ?: null,
    'line2' => $address['complement'] ?? null,
    'city' => $address['city'] ?? null,
    'state' => $address['state'] ?? null,
    'postal_code' => preg_replace('/\D+/', '', $address['zip_code'] ?? '') ?: null,
    'country' => strtoupper($address['country'] ?? 'BR'),
  ]);
  return $payload;
}

function zeefe_stripe_sync_customer(PDO $pdo, StripeClient $stripe, int $clientId, array $address = []): string {
  $client = zeefe_stripe_fetch_client($pdo, $clientId);
  $customerId = zeefe_stripe_ensure_customer($pdo, $stripe, $client);

  $payload = [];
  if (!empty($client['name'])) {
    $payload['name'] = $client['name'];
  }
  if (!empty($client['email'])) {
    $payload['email'] = $client['email'];
  }
  $phone = zeefe_stripe_format_phone($client['phone'] ?? ($client['whatsapp'] ?? null));
  if ($phone) {
    $payload['phone'] = $phone;
  }
  $addressPayload = zeefe_stripe_address_payload($address);
  if ($addressPayload) {
    $payload['address'] = $addressPayload;
  }

  if ($payload) {
    $stripe->customers->update($customerId, $payload);
  }

  return $customerId;
}

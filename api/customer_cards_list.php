<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/stripe_helpers.php';

if (!$pdo) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $ZEEFE_DB_ERROR ?? 'Banco de dados indisponível.']);
  exit;
}

try {
  $input = ($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' ? $_GET : getJsonInput();
  $clientId = (int)($input['client_id'] ?? 0);
  if ($clientId <= 0 && isset($_SESSION['client_id'])) {
    $clientId = (int)$_SESSION['client_id'];
  }
  if ($clientId <= 0) {
    throw new RuntimeException('Informe client_id.');
  }

  zeefe_stripe_ensure_schema($pdo);

  $stmt = $pdo->prepare('SELECT id, brand, last4, exp_month, exp_year, holder_name, status, stripe_payment_method_id, pagarme_card_id, created_at, updated_at FROM customer_cards WHERE client_id = :client ORDER BY updated_at DESC, id DESC');
  $stmt->execute([':client' => $clientId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $cards = array_map(function (array $row) {
    $provider = $row['stripe_payment_method_id'] ? 'stripe' : 'pagarme';
    return [
      'id' => (int)$row['id'],
      'brand' => $row['brand'],
      'last4' => $row['last4'],
      'exp_month' => (int)($row['exp_month'] ?? 0),
      'exp_year' => (int)($row['exp_year'] ?? 0),
      'holder_name' => $row['holder_name'],
      'status' => $row['status'],
      'provider' => $provider,
      'payment_method_id' => $row['stripe_payment_method_id'] ?: $row['pagarme_card_id'],
      'stripe_payment_method_id' => $row['stripe_payment_method_id'],
      'pagarme_card_id' => $row['pagarme_card_id'],
      'created_at' => $row['created_at'],
      'updated_at' => $row['updated_at']
    ];
  }, $rows ?: []);

  echo json_encode([
    'success' => true,
    'cards' => $cards
  ]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'error' => $e->getMessage()
  ]);
}

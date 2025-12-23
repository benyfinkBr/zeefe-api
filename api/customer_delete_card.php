<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/stripe_helpers.php';

use Stripe\Exception\ApiErrorException;

if (!$pdo) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $ZEEFE_DB_ERROR ?? 'Banco de dados indisponível.']);
  exit;
}

try {
  $input = getJsonInput();
  $clientId = (int)($input['client_id'] ?? 0);
  $cardId = (int)($input['card_id'] ?? 0);
  $paymentMethodId = trim((string)($input['payment_method_id'] ?? ''));

  if ($clientId <= 0) {
    throw new RuntimeException('Informe client_id.');
  }
  if ($cardId <= 0 && $paymentMethodId === '') {
    throw new RuntimeException('Informe card_id ou payment_method_id.');
  }

  zeefe_stripe_ensure_schema($pdo);

  $params = [':client_id' => $clientId];
  $filter = 'client_id = :client_id AND ';
  if ($cardId > 0) {
    $filter .= 'id = :id';
    $params[':id'] = $cardId;
  } else {
    $filter .= 'stripe_payment_method_id = :pm';
    $params[':pm'] = $paymentMethodId;
  }

  $stmt = $pdo->prepare("SELECT id, stripe_payment_method_id FROM customer_cards WHERE {$filter} LIMIT 1");
  $stmt->execute($params);
  $card = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$card) {
    throw new RuntimeException('Cartão não encontrado.');
  }

  $stripePm = $card['stripe_payment_method_id'] ?? '';
  if ($stripePm) {
    try {
      $stripe = zeefe_stripe_client($config);
      $stripe->paymentMethods->detach($stripePm);
    } catch (ApiErrorException $e) {
      error_log('[Stripe] Falha ao desassociar payment_method ' . $stripePm . ': ' . $e->getMessage());
    }
  }

  $del = $pdo->prepare('DELETE FROM customer_cards WHERE id = :id LIMIT 1');
  $del->execute([':id' => $card['id']]);

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

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
  if ($clientId <= 0) {
    throw new RuntimeException('Informe client_id.');
  }

  $stripeConfig = zeefe_stripe_config($config);
  $stripe = zeefe_stripe_client($config);

  $client = zeefe_stripe_fetch_client($pdo, $clientId);
  $customerId = zeefe_stripe_ensure_customer($pdo, $stripe, $client);

  $setupIntent = $stripe->setupIntents->create([
    'customer' => $customerId,
    'payment_method_types' => ['card'],
    'usage' => 'off_session',
    'metadata' => [
      'zeefe_client_id' => $clientId
    ]
  ]);

  echo json_encode([
    'success' => true,
    'setup_intent_id' => $setupIntent->id,
    'client_secret' => $setupIntent->client_secret,
    'publishable_key' => $stripeConfig['publishable_key'] ?? null
  ]);
} catch (ApiErrorException $e) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'error' => $e->getError()->message ?? $e->getMessage()
  ]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'error' => $e->getMessage()
  ]);
}

<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/stripe_helpers.php';

use Stripe\Exception\ApiErrorException;

if (!$pdo) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $ZEEFE_DB_ERROR ?? 'Banco de dados indisponível.']);
  exit;
}

function normalize_bool($value, bool $default = true): bool {
  if (!isset($value)) {
    return $default;
  }
  if (is_bool($value)) {
    return $value;
  }
  if (is_numeric($value)) {
    return ((int)$value) === 1;
  }
  $value = strtolower(trim((string)$value));
  if ($value === 'false' || $value === '0' || $value === 'no' || $value === 'off') {
    return false;
  }
  if ($value === 'true' || $value === '1' || $value === 'yes' || $value === 'on') {
    return true;
  }
  return $default;
}

try {
  $input = getJsonInput();
  $clientId = (int)($input['client_id'] ?? 0);
  $setupIntentId = trim((string)($input['setup_intent_id'] ?? ''));
  $paymentMethodId = trim((string)($input['payment_method_id'] ?? ''));
  $setDefault = normalize_bool($input['set_default'] ?? null, true);

  if ($clientId <= 0) {
    throw new RuntimeException('Informe client_id.');
  }
  if ($setupIntentId === '' && $paymentMethodId === '') {
    throw new RuntimeException('Informe setup_intent_id ou payment_method_id.');
  }

  $stripeConfig = zeefe_stripe_config($config);
  $stripe = zeefe_stripe_client($config);
  $client = zeefe_stripe_fetch_client($pdo, $clientId);
  $customerId = zeefe_stripe_ensure_customer($pdo, $stripe, $client);

  if ($setupIntentId !== '') {
    $setupIntent = $stripe->setupIntents->retrieve($setupIntentId, [
      'expand' => ['latest_attempt']
    ]);
    if ($setupIntent->customer && $setupIntent->customer !== $customerId) {
      throw new RuntimeException('Este SetupIntent pertence a outro cliente.');
    }
    if (!in_array($setupIntent->status, ['succeeded', 'processing'], true)) {
      throw new RuntimeException('SetupIntent ainda não foi concluído.');
    }
    $paymentMethodId = $setupIntent->payment_method ?: '';
    if ($paymentMethodId === '' && isset($setupIntent->latest_attempt) && $setupIntent->latest_attempt instanceof \Stripe\SetupAttempt) {
      $paymentMethodId = $setupIntent->latest_attempt->payment_method ?? '';
    }
    if ($paymentMethodId === '') {
      throw new RuntimeException('Stripe não retornou o payment_method.');
    }
  }

  $paymentMethod = $stripe->paymentMethods->retrieve($paymentMethodId, []);
  $pmCustomer = $paymentMethod->customer;
  if ($pmCustomer && $pmCustomer !== $customerId) {
    throw new RuntimeException('Este cartão já está ligado a outro cliente.');
  }
  if (!$pmCustomer) {
    $stripe->paymentMethods->attach($paymentMethodId, ['customer' => $customerId]);
  }

  if ($setDefault) {
    $stripe->customers->update($customerId, [
      'invoice_settings' => [
        'default_payment_method' => $paymentMethodId
      ]
    ]);
  }

  $card = $paymentMethod->card ?? null;
  if (!$card) {
    throw new RuntimeException('Método informado não é um cartão.');
  }

  $cardRecord = zeefe_stripe_upsert_card($pdo, $clientId, $customerId, [
    'payment_method_id' => $paymentMethodId,
    'brand' => $card->brand ?? null,
    'last4' => $card->last4 ?? null,
    'exp_month' => $card->exp_month ?? null,
    'exp_year' => $card->exp_year ?? null,
    'holder' => $paymentMethod->billing_details->name ?? null,
    'fingerprint' => $card->fingerprint ?? null
  ]);

  echo json_encode([
    'success' => true,
    'card' => $cardRecord,
    'stripe_customer_id' => $customerId,
    'set_default' => $setDefault
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

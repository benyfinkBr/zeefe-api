<?php

/**
 * Wrapper for HTTP calls to the Pagar.me Core API.
 */
function pagarme_request(string $method, string $path, array $body = null) {
  global $config;
  $pagarme = $config['pagarme'] ?? null;
  if (!$pagarme || empty($pagarme['secret_key'])) {
    throw new RuntimeException('Pagar.me não configurado.');
  }

  $url = 'https://api.pagar.me/core/v5' . $path;
  $ch = curl_init($url);
  $headers = [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($pagarme['secret_key'] . ':')
  ];

  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => strtoupper($method),
    CURLOPT_HTTPHEADER     => $headers,
    CURLOPT_TIMEOUT        => 30,
  ]);

  if ($body !== null) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
  }

  $response = curl_exec($ch);
  if ($response === false) {
    $error = curl_error($ch);
    curl_close($ch);
    throw new RuntimeException('Erro ao comunicar com a Pagar.me: ' . $error);
  }
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  $json = json_decode($response, true);
  if ($status >= 400) {
    error_log('Stripe error (' . $status . '): ' . $response);
    $extraParts = [];
    if (!empty($json['errors']) && is_array($json['errors'])) {
      $details = array_map(function ($e) {
        $param = $e['parameter_name'] ?? $e['path'] ?? '';
        $msg = $e['message'] ?? '';
        $code = $e['code'] ?? '';
        return trim($param . ': ' . $msg . ($code ? " ({$code})" : ''));
      }, $json['errors']);
      $extraParts[] = 'Detalhes: ' . implode(' | ', $details);
    }
    if (!empty($json)) {
      $extraParts[] = 'Resposta: ' . json_encode($json);
    }
    $message = $json['message'] ?? $response;
    $extra = $extraParts ? (' ' . implode(' ', $extraParts)) : '';
    throw new RuntimeException('Pagar.me retornou erro (' . $status . '): ' . $message . $extra);
  }
  return $json;
}

/**
 * Cria um pedido no modo checkout e retorna order/payment com a URL.
 */
function pagarme_create_checkout_order(array $options): array {
  $amountCents = (int)($options['amount_cents'] ?? 0);
  if ($amountCents <= 0) {
    throw new InvalidArgumentException('Valor inválido para o checkout.');
  }
  global $config;
  $methods = $config['pagarme']['accepted_payment_methods'] ?? ['credit_card'];
  $expires = (int)($config['pagarme']['checkout_expiration_seconds'] ?? 86400);

  $customer = $options['customer'] ?? [];
  if ($customer) {
    foreach ($customer as $key => $value) {
      if ($value === null || $value === '') {
        unset($customer[$key]);
      }
    }
    if (isset($customer['phones']) && !$customer['phones']) {
      unset($customer['phones']);
    }
  }
  $items = $options['items'] ?? [];
  if (!$items) {
    $items = [[
      'amount' => $amountCents,
      'description' => $options['description'] ?? 'Pagamento Ze.EFE',
      'quantity' => 1,
      'code' => $options['code'] ?? 'item'
    ]];
  }

  $payload = [
    'code' => $options['code'] ?? ('pedido_' . uniqid()),
    'items' => $items,
    'customer' => $customer,
    'payments' => [],
    'metadata' => $options['metadata'] ?? []
  ];

  $ensureSingleCheckout = function(array $accepted) use (&$payload, $amountCents, $expires) {
    $checkoutConfig = [
      'expires_in' => $expires,
      'customer_editable' => true,
      'billing_address_editable' => true,
      'shipping_address_editable' => true,
      'skip_checkout_success_page' => false,
      'accepted_payment_methods' => $accepted
    ];
    if (in_array('pix', $accepted, true)) {
      $checkoutConfig['pix'] = ['expires_in' => 3600];
    }
    if (in_array('boleto', $accepted, true)) {
      $dueDate = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
        ->modify('+3 days')
        ->format('Y-m-d\TH:i:s\Z');
      $checkoutConfig['boleto'] = [
        'due_at' => $dueDate,
        'instructions' => 'Válido por 3 dias após emissão.'
      ];
    }
    $payload['payments'][] = [
      'payment_method' => 'checkout',
      'amount' => $amountCents,
      'checkout' => $checkoutConfig
    ];
  };

  $hasCard = in_array('credit_card', $methods, true);
  $otherMethods = array_values(array_diff($methods, ['credit_card']));
  if ($hasCard) {
    $ensureSingleCheckout(['credit_card']);
  }
  if ($otherMethods) {
    $ensureSingleCheckout($otherMethods);
  }
  if (!$hasCard && !$otherMethods) {
    $ensureSingleCheckout(['credit_card']);
  }

  if (!empty($config['pagarme']['debug']) && $config['pagarme']['debug']) {
    error_log('[PAGARME] Payload order: ' . json_encode($payload));
  }

  $response = pagarme_request('POST', '/orders', $payload);

  if (!empty($config['pagarme']['debug']) && $config['pagarme']['debug']) {
    error_log('[PAGARME] Order response: ' . json_encode($response));
  }

  return $response;
}

function pagarme_extract_checkout_url(array $order): ?string {
  if (!empty($order['checkouts'])) {
    foreach ($order['checkouts'] as $checkout) {
      if (!empty($checkout['payment_url'])) {
        return $checkout['payment_url'];
      }
    }
  }
  if (!empty($order['payments'])) {
    foreach ($order['payments'] as $payment) {
      if (($payment['payment_method'] ?? '') === 'checkout') {
        if (!empty($payment['checkout']['payment_url'])) {
          return $payment['checkout']['payment_url'];
        }
      }
    }
  }
  if (!empty($order['charges'])) {
    foreach ($order['charges'] as $charge) {
      $tx = $charge['last_transaction'] ?? null;
      if ($tx && ($tx['transaction_type'] ?? '') === 'checkout' && !empty($tx['payment_url'])) {
        return $tx['payment_url'];
      }
    }
  }
  return null;
}

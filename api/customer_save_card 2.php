<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

const PAGARME_SECRET_KEY = 'sk_test_3ae095644045411a8b5e61da34f6d354';

/**
 * Busca os dados do token diretamente na Pagar.me para obter as infos do cartão.
 */
function fetchPagarmeToken(string $token): array {
  $url = 'https://api.pagar.me/1/tokens/' . urlencode($token);
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'Authorization: Basic ' . base64_encode(PAGARME_SECRET_KEY . ':')
    ],
    CURLOPT_TIMEOUT => 30
  ]);

  $response = curl_exec($ch);
  if ($response === false) {
    $err = curl_error($ch);
    curl_close($ch);
    throw new RuntimeException('Erro ao consultar token na Pagar.me: ' . $err);
  }

  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  $json = json_decode($response, true);
  if (!is_array($json)) {
    throw new RuntimeException('Resposta inválida da Pagar.me.');
  }
  if ($status >= 400) {
    $message = $json['errors'][0]['message'] ?? ($json['message'] ?? 'Erro ao consultar token.');
    throw new RuntimeException($message);
  }

  return $json;
}

/**
 * Permite compatibilidade com colunas antigas ou novas.
 */
function resolvePagarmeIdColumn(PDO $pdo): string {
  $stmt = $pdo->prepare("SHOW COLUMNS FROM customer_cards LIKE 'pagarme_id'");
  $stmt->execute();
  return $stmt->fetch() ? 'pagarme_id' : 'pagarme_card_id';
}

function extractCardData(array $payload): array {
  $card = $payload['card'] ?? $payload;

  $brand = $card['brand'] ?? ($payload['card_brand'] ?? ($payload['brand'] ?? null));
  $last4 = $card['last_digits'] ?? ($card['last_four_digits'] ?? ($card['last_four'] ?? ($payload['last4'] ?? null)));
  $expMonth = $card['expiration_month'] ?? ($card['exp_month'] ?? null);
  $expYear = $card['expiration_year'] ?? ($card['exp_year'] ?? null);

  if (!$expMonth || !$expYear) {
    $expDate = $card['expiration_date'] ?? null; // formato MMYY
    if ($expDate && preg_match('/^(\\d{2})(\\d{2})$/', $expDate, $m)) {
      $expMonth = $expMonth ?: $m[1];
      $expYear = $expYear ?: ('20' . $m[2]);
    }
  }

  if (!$brand || !$last4 || !$expMonth || !$expYear) {
    throw new RuntimeException('Dados do cartão não retornados pelo token.');
  }

  $pagarmeId = $payload['id'] ?? ($card['id'] ?? null);

  $expMonth = str_pad((string) $expMonth, 2, '0', STR_PAD_LEFT);
  $expYear = (string) $expYear;

  return [
    'pagarme_id' => $pagarmeId,
    'brand' => $brand,
    'last4' => substr($last4, -4),
    'exp_month' => $expMonth,
    'exp_year' => $expYear
  ];
}

try {
  $input = json_decode(file_get_contents('php://input'), true);
  if (!is_array($input)) {
    throw new RuntimeException('JSON inválido.');
  }

  $clientId = (int) ($input['client_id'] ?? 0);
  $token = trim($input['pagarmetoken'] ?? '');

  if ($clientId <= 0 || $token === '') {
    throw new RuntimeException('Informe client_id e pagarmetoken.');
  }

  // Valida cliente
  $stmt = $pdo->prepare('SELECT id FROM clients WHERE id = ? LIMIT 1');
  $stmt->execute([$clientId]);
  if (!$stmt->fetchColumn()) {
    throw new RuntimeException('Cliente não encontrado.');
  }

  $tokenData = fetchPagarmeToken($token);
  $cardData = extractCardData($tokenData);

  $pagarmeIdColumn = resolvePagarmeIdColumn($pdo);
  $sql = "INSERT INTO customer_cards (client_id, {$pagarmeIdColumn}, brand, last4, exp_month, exp_year, created_at)
          VALUES (:client_id, :pagarme_id, :brand, :last4, :exp_month, :exp_year, NOW())";

  $stmtInsert = $pdo->prepare($sql);
  $stmtInsert->execute([
    ':client_id' => $clientId,
    ':pagarme_id' => $cardData['pagarme_id'] ?? $token,
    ':brand' => $cardData['brand'],
    ':last4' => $cardData['last4'],
    ':exp_month' => $cardData['exp_month'],
    ':exp_year' => $cardData['exp_year']
  ]);

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $token = trim($data['token'] ?? '');
  if ($token === '') {
    echo json_encode(['success' => false, 'error' => 'Token ausente.']);
    exit;
  }

  $hash = hash('sha256', $token);
  $now = (new DateTimeImmutable())->format('Y-m-d H:i:s');

  $sql = 'SELECT t.advertiser_id, t.expires_at, a.*
          FROM advertiser_remember_tokens t
          JOIN advertisers a ON a.id = t.advertiser_id
          WHERE t.token_hash = :hash
          LIMIT 1';
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':hash' => $hash]);
  $adv = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$adv) {
    echo json_encode(['success' => false, 'error' => 'Token inválido.']);
    exit;
  }

  if ($adv['expires_at'] < $now) {
    echo json_encode(['success' => false, 'error' => 'Token expirado.']);
    exit;
  }

  if (in_array(strtolower($adv['status'] ?? ''), ['inativo','bloqueado'], true)) {
    echo json_encode(['success' => false, 'error' => 'Conta inativa.']);
    exit;
  }

  if (empty($adv['email_verified_at'])) {
    echo json_encode(['success' => false, 'error' => 'Confirme seu e-mail para acessar o portal.']);
    exit;
  }

  $payload = [
    'id' => (int)$adv['id'],
    'display_name' => $adv['display_name'] ?? null,
    'full_name' => $adv['full_name'] ?? null,
    'email' => $adv['login_email'] ?? null,
    'login_cpf' => $adv['login_cpf'] ?? null,
    'status' => $adv['status'] ?? 'ativo',
    'owner_type' => $adv['owner_type'] ?? null,
    'owner_id' => isset($adv['owner_id']) ? (int)$adv['owner_id'] : null,
    'bank_name' => $adv['bank_name'] ?? null,
    'account_type' => $adv['account_type'] ?? null,
    'account_number' => $adv['account_number'] ?? null,
    'pix_key' => $adv['pix_key'] ?? null,
    'contact_phone' => $adv['contact_phone'] ?? null
  ];

  echo json_encode(['success' => true, 'advertiser' => $payload]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


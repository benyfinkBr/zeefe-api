<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $login = trim($data['login'] ?? '');
  $password = (string)($data['password'] ?? '');
  $remember = !empty($data['remember']);

  if ($login === '' || $password === '') {
    echo json_encode(['success' => false, 'error' => 'Informe login e senha.']);
    exit;
  }

  // Permite e-mail ou CPF
  $cpfDigits = preg_replace('/\D/', '', $login);
  $stmt = $pdo->prepare('SELECT * FROM advertisers WHERE login_email = :login OR login_cpf = :cpf LIMIT 1');
  $stmt->execute([':login' => $login, ':cpf' => $cpfDigits]);
  $adv = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$adv) {
    echo json_encode(['success' => false, 'error' => 'Credenciais inválidas.']);
    exit;
  }

  if (in_array(strtolower($adv['status'] ?? ''), ['inativo','bloqueado'], true)) {
    echo json_encode(['success' => false, 'error' => 'Conta inativa.']);
    exit;
  }

  $hash = (string)($adv['password_hash'] ?? '');
  $ok = false;
  if ($hash) {
    $info = password_get_info($hash);
    if (($info['algo'] ?? 0) !== 0) {
      $ok = password_verify($password, $hash);
    }
  }
  if (!$ok) {
    echo json_encode(['success' => false, 'error' => 'Credenciais inválidas.']);
    exit;
  }

  // Requer e-mail verificado
  if (empty($adv['email_verified_at'])) {
    echo json_encode(['success' => false, 'error' => 'Confirme seu e-mail para acessar o portal.']);
    exit;
  }

  // Atualiza último acesso
  try {
    $upd = $pdo->prepare('UPDATE advertisers SET last_login = NOW() WHERE id = :id');
    $upd->execute([':id' => $adv['id']]);
  } catch (Throwable $e) {}

  // Monta payload enxuto ao front
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

  // Remember-me opcional (24h)
  $rememberPayload = null;
  if ($remember) {
    try {
      $rawToken = bin2hex(random_bytes(32));
      $tokenHash = hash('sha256', $rawToken);
      $expiresAt = (new DateTimeImmutable('+24 hours'))->format('Y-m-d H:i:s');
      $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
      $ins = $pdo->prepare('INSERT INTO advertiser_remember_tokens (advertiser_id, token_hash, user_agent, expires_at, created_at) VALUES (:aid,:hash,:ua,:exp,NOW())');
      $ins->execute([
        ':aid' => $adv['id'],
        ':hash' => $tokenHash,
        ':ua' => $ua,
        ':exp' => $expiresAt
      ]);
      $rememberPayload = [
        'token' => $rawToken,
        'expires_at' => $expiresAt
      ];
    } catch (Throwable $e) {
      error_log('Erro ao gerar remember token para anunciante: ' . $e->getMessage());
    }
  }

  session_regenerate_id(true);
  $_SESSION['advertiser_id'] = (int) $adv['id'];
  $_SESSION['advertiser_name'] = $adv['display_name'] ?? $adv['full_name'] ?? ($adv['login_email'] ?? 'Anunciante');
  $_SESSION['auth'] = [
    'logged_in' => true,
    'user_id'   => (int)$adv['id'],
    'name'      => $_SESSION['advertiser_name'],
    'email'     => $adv['login_email'] ?? '',
    'role'      => 'advertiser',
    'ts'        => time(),
  ];

  echo json_encode(['success' => true, 'advertiser' => $payload, 'remember' => $rememberPayload]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

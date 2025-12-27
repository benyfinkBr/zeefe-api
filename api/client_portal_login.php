<?php
require 'apiconfig.php';

$data = json_decode(file_get_contents('php://input'), true);
$login = trim($data['login'] ?? '');
$password = $data['password'] ?? '';
$remember = !empty($data['remember']);

if ($login === '' || $password === '') {
  echo json_encode(['success' => false, 'error' => 'Informe login e senha.']);
  exit;
}

try {
  try {
    $stmt = $pdo->prepare('SELECT id, name, email, email_verified_at, login, cpf, password_hash, company_id, status, phone, whatsapp FROM clients WHERE login = :login OR email = :email OR cpf = :cpf LIMIT 1');
    $stmt->execute([
      ':login' => $login,
      ':email' => $login,
      ':cpf' => preg_replace('/\D/', '', $login)
    ]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
  } catch (Throwable $e) {
    $stmt = $pdo->prepare('SELECT id, name, email, email_verified_at, login, cpf, password_hash, company_id, status, phone, whatsapp FROM clients WHERE login = :login OR email = :email OR cpf = :cpf LIMIT 1');
    $stmt->execute([
      ':login' => $login,
      ':email' => $login,
      ':cpf' => preg_replace('/\D/', '', $login)
    ]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
  }

  if (!$client) {
    echo json_encode(['success' => false, 'error' => 'Credenciais inválidas.']);
    exit;
  }

  if (in_array(strtolower($client['status']), ['inativo', 'bloqueado'], true)) {
    echo json_encode(['success' => false, 'error' => 'Conta inativa.']);
    exit;
  }

  $validated = false;
  $hash = $client['password_hash'] ?? '';
  if ($hash) {
    $info = password_get_info($hash);
    if (($info['algo'] ?? 0) !== 0) {
      $validated = password_verify($password, $hash);
    }
  }

  if (!$validated) {
    echo json_encode(['success' => false, 'error' => 'Credenciais inválidas.']);
    exit;
  }

  // Bloquear login se e-mail não verificado
  if (empty($client['email_verified_at'])) {
    echo json_encode([
      'success' => false,
      'error' => 'Confirme seu e-mail para acessar o portal.',
      'code' => 'email_unverified'
    ]);
    exit;
  }

  // Enriquecer com informações de empresa e flag de master
  $companyId = $client['company_id'] ?? null;
  $companyName = null;
  $isCompanyMaster = false;
  if (!empty($companyId)) {
    try {
      // Tenta buscar master_client_id; se a coluna não existir, tratamos como não-master
      $q = $pdo->prepare('SELECT id, nome_fantasia, master_client_id FROM companies WHERE id = :id LIMIT 1');
      $q->execute([':id' => $companyId]);
      if ($row = $q->fetch(PDO::FETCH_ASSOC)) {
        $companyName = $row['nome_fantasia'] ?? null;
        if (array_key_exists('master_client_id', $row)) {
          $isCompanyMaster = (string)($row['master_client_id'] ?? '') === (string)$client['id'];
        }
      }
    } catch (Throwable $e) {
      // coluna ausente ou erro: mantém isCompanyMaster=false, sem quebrar o login
    }
  }

  $rememberPayload = null;
  // endereço mais recente
  $addrStmt = $pdo->prepare('SELECT street, number, complement, zip_code, city, state, country FROM client_addresses WHERE client_id = :cid ORDER BY updated_at DESC, id DESC LIMIT 1');
  $addrStmt->execute([':cid' => $client['id']]);
  $clientAddress = $addrStmt->fetch(PDO::FETCH_ASSOC) ?: null;
  if ($remember) {
    try {
      $rawToken = bin2hex(random_bytes(32));
      $tokenHash = hash('sha256', $rawToken);
      $expiresAt = (new DateTimeImmutable('+24 hours'))->format('Y-m-d H:i:s');
      $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
      $ins = $pdo->prepare('INSERT INTO client_remember_tokens (client_id, token_hash, user_agent, expires_at, created_at) VALUES (:cid,:hash,:ua,:exp,NOW())');
      $ins->execute([
        ':cid' => $client['id'],
        ':hash' => $tokenHash,
        ':ua' => $ua,
        ':exp' => $expiresAt
      ]);
      $rememberPayload = [
        'token' => $rawToken,
        'expires_at' => $expiresAt
      ];
    } catch (Throwable $e) {
      error_log('Erro ao gerar remember token: ' . $e->getMessage());
    }
  }

  echo json_encode([
    'success' => true,
    'client' => [
      'id' => $client['id'],
      'name' => $client['name'],
      'email' => $client['email'],
      'login' => $client['login'],
      'cpf' => $client['cpf'],
      'company_id' => $companyId,
      'company_name' => $companyName,
      'company_master' => $isCompanyMaster,
      'phone' => $client['phone'] ?? null,
      'whatsapp' => $client['whatsapp'] ?? null,
      'address' => $clientAddress
    ],
    'remember' => $rememberPayload
  ]);

  session_regenerate_id(true);
  $_SESSION['client_id'] = $client['id'];
  $_SESSION['client_name'] = $client['name'];
  $_SESSION['auth'] = [
    'logged_in' => true,
    'user_id'   => (int)$client['id'],
    'name'      => $client['name'],
    'email'     => $client['email'],
    'role'      => 'client',
    'ts'        => time(),
  ];
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

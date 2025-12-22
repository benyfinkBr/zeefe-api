<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/stripe_helpers.php';

$data = json_decode(file_get_contents('php://input'), true);
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$login = trim($data['login'] ?? '');
$password = $data['password'] ?? '';
$cpf = preg_replace('/\D/', '', $data['cpf'] ?? '');
$phone = preg_replace('/\D/', '', $data['phone'] ?? '');
$type = strtoupper(trim($data['type'] ?? 'PF'));
$companyId = isset($data['company_id']) && $data['company_id'] !== '' ? (int) $data['company_id'] : null;

if ($name === '' || $email === '' || $login === '' || $password === '') {
  echo json_encode(['success' => false, 'error' => 'Preencha todos os campos obrigatórios.']);
  exit;
}

try {
  $exists = $pdo->prepare('SELECT email, login, cpf FROM clients WHERE login = :login OR email = :email OR cpf = :cpf LIMIT 1');
  $exists->execute([':login' => $login, ':email' => $email, ':cpf' => $cpf]);
  if ($dup = $exists->fetch(PDO::FETCH_ASSOC)) {
    $dupKey = '';
    if (!empty($dup['email']) && strtolower($dup['email']) === strtolower($email)) $dupKey = 'e-mail';
    elseif (!empty($dup['login']) && strtolower($dup['login']) === strtolower($login)) $dupKey = 'login';
    elseif (!empty($dup['cpf']) && $dup['cpf'] === $cpf) $dupKey = 'CPF';
    $msg = $dupKey ? "Este {$dupKey} já está cadastrado. Tente outro." : 'Login ou e-mail já cadastrado.';
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
  }

$hash = password_hash($password, PASSWORD_DEFAULT);
  // Gera token de verificação de e-mail (válido por 48h)
  $verificationToken = bin2hex(random_bytes(32));
  $verificationExpires = (new DateTimeImmutable('+48 hours'))->format('Y-m-d H:i:s');

  $stmt = $pdo->prepare('INSERT INTO clients (name, email, email_verified_at, verification_token, verification_token_expires, login, password_hash, cpf, phone, whatsapp, type, company_id, status, created_at, updated_at) VALUES (:name,:email,NULL,:vtoken,:vexpires,:login,:hash,:cpf,:phone,:whatsapp,:type,:company_id,:status,NOW(),NOW())');
  $stmt->execute([
    ':name' => $name,
    ':email' => $email,
    ':vtoken' => $verificationToken,
    ':vexpires' => $verificationExpires,
    ':login' => $login,
    ':hash' => $hash,
    ':cpf' => $cpf ?: null,
    ':phone' => $phone ?: null,
    ':whatsapp' => $phone ?: null,
    ':type' => $type,
    ':company_id' => $companyId ?: null,
    ':status' => 'pendente'
  ]);

  $id = (int) $pdo->lastInsertId();

  $stripe = zeefe_stripe_client($config);
  zeefe_stripe_sync_customer($pdo, $stripe, $id);

  $response = [
    'success' => true,
    'client' => [
      'id' => $id,
      'name' => $name,
      'email' => $email,
      'login' => $login,
      'cpf' => $cpf,
      'company_id' => $companyId,
      'phone' => $phone ?: null,
      'whatsapp' => $phone ?: null
    ]
  ];

  try {
    $verifyLink = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://')
      . ($_SERVER['HTTP_HOST'] ?? 'zeefe.com.br')
      . dirname($_SERVER['SCRIPT_NAME'])
      . '/client_verify_email.php?token=' . urlencode($verificationToken);
    $html = mailer_render('account_verify.php', [
      'cliente_nome' => $name,
      'verify_link' => $verifyLink
    ]);
    mailer_send($email, 'Ze.EFE - Confirme seu e-mail', $html);
  } catch (Throwable $mailError) {
    error_log('Falha ao enviar e-mail de boas-vindas: ' . $mailError->getMessage());
  }

  echo json_encode($response);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

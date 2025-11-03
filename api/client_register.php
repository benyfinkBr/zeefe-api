<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';

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
  $exists = $pdo->prepare('SELECT COUNT(*) FROM clients WHERE login = :login OR email = :email');
  $exists->execute([':login' => $login, ':email' => $email]);
  if ($exists->fetchColumn() > 0) {
    echo json_encode(['success' => false, 'error' => 'Login ou e-mail já cadastrado.']);
    exit;
  }

  $hash = password_hash($password, PASSWORD_DEFAULT);

  $stmt = $pdo->prepare('INSERT INTO clients (name, email, login, password, password_hash, cpf, phone, whatsapp, type, company_id, status, created_at, updated_at) VALUES (:name,:email,:login,:password,:hash,:cpf,:phone,:whatsapp,:type,:company_id,:status,NOW(),NOW())');
  $stmt->execute([
    ':name' => $name,
    ':email' => $email,
    ':login' => $login,
    ':password' => $password,
    ':hash' => $hash,
    ':cpf' => $cpf ?: null,
    ':phone' => $phone ?: null,
    ':whatsapp' => $phone ?: null,
    ':type' => $type,
    ':company_id' => $companyId ?: null,
    ':status' => 'ativo'
  ]);

  $id = (int) $pdo->lastInsertId();

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
    $html = mailer_render('account_welcome.php', [
      'cliente_nome' => $name,
      'login' => $login,
      'email' => $email
    ]);
    mailer_send($email, 'Bem-vindo ao Portal Ze.EFE', $html);
  } catch (Throwable $mailError) {
    error_log('Falha ao enviar e-mail de boas-vindas: ' . $mailError->getMessage());
  }

  echo json_encode($response);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

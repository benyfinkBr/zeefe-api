<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';

$data = getJsonInput();
$login = trim($data['login'] ?? '');
if ($login === '') {
  echo json_encode(['success' => false, 'error' => 'Informe login ou e-mail.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT id, name, email, email_verified_at FROM clients WHERE login = :login OR email = :login OR cpf = :cpf LIMIT 1');
  $stmt->execute([':login' => $login, ':cpf' => preg_replace('/\D/', '', $login)]);
  $client = $stmt->fetch();
  if (!$client) {
    echo json_encode(['success' => false, 'error' => 'Conta não encontrada.']);
    exit;
  }
  if (!empty($client['email_verified_at'])) {
    echo json_encode(['success' => true, 'message' => 'E-mail já está verificado.']);
    exit;
  }

  $token = bin2hex(random_bytes(32));
  $expires = (new DateTimeImmutable('+48 hours'))->format('Y-m-d H:i:s');
  $upd = $pdo->prepare('UPDATE clients SET verification_token = :t, verification_token_expires = :e, updated_at = NOW() WHERE id = :id');
  $upd->execute([':t' => $token, ':e' => $expires, ':id' => $client['id']]);

  $verifyLink = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://')
    . ($_SERVER['HTTP_HOST'] ?? 'zeefe.com.br')
    . dirname($_SERVER['SCRIPT_NAME'])
    . '/client_verify_email.php?token=' . urlencode($token);

  $html = mailer_render('account_verify.php', [
    'cliente_nome' => $client['name'] ?? 'Cliente',
    'verify_link' => $verifyLink
  ]);
  mailer_send($client['email'], 'Ze.EFE - Confirme seu e-mail', $html);

  echo json_encode(['success' => true, 'message' => 'Enviamos um novo link de verificação para seu e-mail.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


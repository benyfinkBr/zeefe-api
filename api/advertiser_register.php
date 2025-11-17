<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $displayName = trim($data['display_name'] ?? '');
  $email = trim($data['login_email'] ?? '');
  $password = (string)($data['password'] ?? '');
  $ownerType = trim($data['owner_type'] ?? 'advertiser');
  $ownerId = isset($data['owner_id']) && $data['owner_id'] !== '' ? (int)$data['owner_id'] : null;

  if ($displayName === '' || $email === '' || $password === '') {
    echo json_encode(['success' => false, 'error' => 'Preencha nome, e‑mail e senha.']);
    exit;
  }

  // Verifica duplicidade de e-mail
  $chk = $pdo->prepare('SELECT COUNT(*) FROM advertisers WHERE login_email = :e');
  $chk->execute([':e' => $email]);
  if ($chk->fetchColumn() > 0) {
    echo json_encode(['success' => false, 'error' => 'E‑mail já cadastrado.']);
    exit;
  }

  $hash = password_hash($password, PASSWORD_DEFAULT);
  $token = bin2hex(random_bytes(32));
  $expires = (new DateTimeImmutable('+48 hours'))->format('Y-m-d H:i:s');

  $sql = 'INSERT INTO advertisers (display_name, login_email, password_hash, status, email_verified_at, verification_token, verification_token_expires, owner_type, owner_id, created_at, updated_at)
          VALUES (:n, :e, :h, "ativo", NULL, :t, :x, :ot, :oi, NOW(), NOW())';
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':n' => $displayName,
    ':e' => $email,
    ':h' => $hash,
    ':t' => $token,
    ':x' => $expires,
    ':ot' => $ownerType ?: null,
    ':oi' => $ownerId ?: null,
  ]);
  $id = (int)$pdo->lastInsertId();

  // E-mail de verificação
  try {
    $verifyLink = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://')
      . ($_SERVER['HTTP_HOST'] ?? 'zeefe.com.br')
      . dirname($_SERVER['SCRIPT_NAME'])
      . '/advertiser_verify_email.php?token=' . urlencode($token);
    $html = mailer_render('advertiser_account_verify.php', [
      'nome' => $displayName,
      'verify_link' => $verifyLink
    ]);
    mailer_send($email, 'Ze.EFE — Confirme seu e‑mail (Anunciante)', $html);
  } catch (Throwable $mailErr) { error_log('Mail adv verify fail: ' . $mailErr->getMessage()); }

  echo json_encode(['success' => true, 'advertiser' => ['id' => $id, 'display_name' => $displayName, 'email' => $email]]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


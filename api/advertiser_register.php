<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $displayName = trim($data['display_name'] ?? '');
  $email = trim($data['login_email'] ?? '');
  $loginCpf = preg_replace('/\D/', '', (string)($data['login_cpf'] ?? ''));
  $password = (string)($data['password'] ?? '');
  // Nosso modelo atual usa a tabela advertisers como conta própria.
  // O schema exige owner_type/owner_id NOT NULL; usamos um owner "neutro" por padrão.
  $ownerType = trim($data['owner_type'] ?? 'client');
  if ($ownerType === '') { $ownerType = 'client'; }
  $ownerId = isset($data['owner_id']) && $data['owner_id'] !== '' ? (int)$data['owner_id'] : 0;

  $fullName = trim($data['full_name'] ?? '');
  $phone = preg_replace('/\D/', '', (string)($data['phone'] ?? ''));

  if ($fullName === '' || $email === '' || $password === '') {
    echo json_encode(['success' => false, 'error' => 'Preencha nome completo, e‑mail e senha.']);
    exit;
  }

  // Verifica duplicidade de e-mail/CPF
  $chk = $pdo->prepare('SELECT COUNT(*) FROM advertisers WHERE login_email = :e OR login_cpf = :c');
  $chk->execute([':e' => $email, ':c' => $loginCpf]);
  if ($chk->fetchColumn() > 0) {
    echo json_encode(['success' => false, 'error' => 'E‑mail já cadastrado.']);
    exit;
  }

  $hash = password_hash($password, PASSWORD_DEFAULT);
  $token = bin2hex(random_bytes(32));
  $expires = (new DateTimeImmutable('+48 hours'))->format('Y-m-d H:i:s');

  // Monta INSERT dinâmico dependendo das colunas disponíveis
  $cols = ['display_name','login_email','login_cpf','password_hash','status','email_verified_at','verification_token','verification_token_expires','owner_type','owner_id','created_at','updated_at'];
  $vals = [':display_name',':login_email',':login_cpf',':password_hash',"'ativo'",'NULL',':verification_token',':verification_expires',':owner_type',':owner_id','NOW()','NOW()'];

  // Tenta detectar colunas opcionais
  $dbName = $pdo->query('SELECT DATABASE()')->fetchColumn();
  $hasFullName = false; $hasPhone = false;
  try {
    $q = $pdo->prepare('SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = "advertisers" AND COLUMN_NAME = :c');
    $q->execute([':db'=>$dbName, ':c'=>'full_name']); $hasFullName = $q->fetchColumn() > 0;
    $q->execute([':db'=>$dbName, ':c'=>'contact_phone']); $hasPhone = $q->fetchColumn() > 0;
  } catch (Throwable $e) { /* ignora e segue sem opcionais */ }
  if ($hasFullName) { $cols[]='full_name'; $vals[]=':full_name'; }
  if ($hasPhone) { $cols[]='contact_phone'; $vals[]=':contact_phone'; }

  $sql = 'INSERT INTO advertisers (' . implode(',', $cols) . ') VALUES (' . implode(',', $vals) . ')';
  $stmt = $pdo->prepare($sql);
  $params = [
    ':display_name' => ($displayName !== '' ? $displayName : $fullName),
    ':login_email' => $email,
    ':login_cpf' => ($loginCpf !== '' ? $loginCpf : null),
    ':password_hash' => $hash,
    ':verification_token' => $token,
    ':verification_expires' => $expires,
    ':owner_type' => $ownerType,
    ':owner_id' => $ownerId,
  ];
  if ($hasFullName) $params[':full_name'] = $fullName;
  if ($hasPhone) $params[':contact_phone'] = ($phone !== '' ? $phone : null);
  $stmt->execute($params);
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

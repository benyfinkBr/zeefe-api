<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $login = trim($data['login'] ?? '');
  if ($login === '') { echo json_encode(['success'=>false,'error'=>'Informe e‑mail ou CPF.']); exit; }

  $cpf = preg_replace('/\D/','', $login);
  $sel = $pdo->prepare('SELECT id, display_name, login_email, email_verified_at FROM advertisers WHERE login_email = :e OR login_cpf = :c LIMIT 1');
  $sel->execute([':e'=>$login, ':c'=>$cpf]);
  $adv = $sel->fetch(PDO::FETCH_ASSOC);
  if (!$adv) { echo json_encode(['success'=>false,'error'=>'Conta não encontrada.']); exit; }
  if (!empty($adv['email_verified_at'])) { echo json_encode(['success'=>true,'message'=>'E‑mail já está verificado.']); exit; }

  $token = bin2hex(random_bytes(32));
  $expires = (new DateTimeImmutable('+48 hours'))->format('Y-m-d H:i:s');
  $upd = $pdo->prepare('UPDATE advertisers SET verification_token = :t, verification_token_expires = :x, updated_at = NOW() WHERE id = :id');
  $upd->execute([':t'=>$token, ':x'=>$expires, ':id'=>$adv['id']]);

  $verifyLink = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://')
    . ($_SERVER['HTTP_HOST'] ?? 'zeefe.com.br')
    . dirname($_SERVER['SCRIPT_NAME'])
    . '/advertiser_verify_email.php?token=' . urlencode($token);

  $html = mailer_render('advertiser_account_verify.php', [
    'nome' => $adv['display_name'] ?? 'Anunciante',
    'verify_link' => $verifyLink
  ]);
  if (!empty($adv['login_email'])) {
    mailer_send($adv['login_email'], 'Ze.EFE — Confirme seu e‑mail (Anunciante)', $html);
  }

  echo json_encode(['success'=>true,'message'=>'Enviamos um novo link de verificação.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


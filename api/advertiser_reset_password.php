<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $login = trim($data['email'] ?? ($data['login'] ?? ''));
  if ($login === '') { echo json_encode(['success'=>false,'error'=>'Informe e‑mail ou CPF.']); exit; }

  $cpf = preg_replace('/\D/', '', $login);
  $sel = $pdo->prepare('SELECT id, display_name, login_email FROM advertisers WHERE login_email = :e OR login_cpf = :c LIMIT 1');
  $sel->execute([':e'=>$login, ':c'=>$cpf]);
  $adv = $sel->fetch(PDO::FETCH_ASSOC);
  if (!$adv) { echo json_encode(['success'=>false,'error'=>'Conta não encontrada.']); exit; }

  $tmp = gerarSenhaTemporaria(10);
  $hash = password_hash($tmp, PASSWORD_DEFAULT);
  $upd = $pdo->prepare('UPDATE advertisers SET password_hash = :h, updated_at = NOW() WHERE id = :id');
  $upd->execute([':h'=>$hash, ':id'=>$adv['id']]);

  try {
    if (!empty($adv['login_email'])) {
      $html = mailer_render('advertiser_password_reset.php', [
        'nome' => $adv['display_name'] ?? 'Anunciante',
        'senha_temporaria' => $tmp
      ]);
      mailer_send($adv['login_email'], 'Ze.EFE — nova senha temporária (Anunciante)', $html, 'Sua nova senha temporária é: '.$tmp);
    }
  } catch (Throwable $mailErr) { error_log('Mail adv reset fail: '.$mailErr->getMessage()); }

  echo json_encode(['success'=>true,'message'=>'Senha temporária gerada e enviada ao e‑mail cadastrado.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

function gerarSenhaTemporaria(int $len = 8): string {
  $bytes = random_bytes($len);
  return substr(str_replace(['/', '+', '='], '', base64_encode($bytes)), 0, $len);
}


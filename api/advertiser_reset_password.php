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

  // Simple IP/email rate-limit: 3 per 10 minutes
  $rlKey = 'adv_reset_' . sha1(($login ?: 'x') . '|' . ($_SERVER['REMOTE_ADDR'] ?? '0'));
  $rlDir = sys_get_temp_dir() . '/zeefe_rl';
  if (!is_dir($rlDir)) { @mkdir($rlDir, 0700, true); }
  $rlFile = $rlDir . '/' . $rlKey;
  $now = time();
  $window = 600; $limit = 3;
  try {
    $history = [];
    if (is_file($rlFile)) {
      $raw = @file_get_contents($rlFile);
      $history = $raw ? array_filter(array_map('intval', explode('\n', $raw))) : [];
      $history = array_values(array_filter($history, function($t) use ($now, $window){ return ($now - $t) <= $window; }));
    }
    if (count($history) >= $limit) {
      http_response_code(429);
      header('Retry-After: 600');
      echo json_encode(['success'=>false,'error'=>'Muitas tentativas. Tente novamente em alguns minutos.']);
      exit;
    }
    $history[] = $now;
    @file_put_contents($rlFile, implode("\n", $history), LOCK_EX);
  } catch (Throwable $e) { /* best-effort */ }

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

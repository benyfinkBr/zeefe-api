<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';

$data = json_decode(file_get_contents('php://input'), true);
$login = trim($data['login'] ?? '');

if ($login === '') {
  echo json_encode(['success' => false, 'error' => 'Informe login ou e-mail.']);
  exit;
}

// Simple IP/email rate-limit: 3 requests per 10 minutes
$rlKey = 'client_reset_' . sha1(($login ?: 'x') . '|' . ($_SERVER['REMOTE_ADDR'] ?? '0'));
$rlDir = sys_get_temp_dir() . '/zeefe_rl';
if (!is_dir($rlDir)) { @mkdir($rlDir, 0700, true); }
$rlFile = $rlDir . '/' . $rlKey;
$now = time();
$window = 600; // 10 minutes
$limit = 3;
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

try {
  $stmt = $pdo->prepare('SELECT id, name, email FROM clients WHERE login = :login OR email = :login OR cpf = :cpf LIMIT 1');
  $stmt->execute([':login' => $login, ':cpf' => preg_replace('/\D/', '', $login)]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$client) {
    echo json_encode(['success' => false, 'error' => 'Conta não encontrada.']);
    exit;
  }

  $newPassword = gerarSenhaTemporaria();
  $hash = password_hash($newPassword, PASSWORD_DEFAULT);

  $update = $pdo->prepare('UPDATE clients SET password = NULL, password_hash = :hash, updated_at = NOW() WHERE id = :id');
  $update->execute([':hash' => $hash, ':id' => $client['id']]);

  // Tentativa de envio de e-mail (ignorar erros silenciosamente)
  if (!empty($client['email'])) {
    try {
      $html = mailer_render('password_reset.php', [
        'cliente_nome' => $client['name'] ?? '',
        'senha_temporaria' => $newPassword
      ]);
      mailer_send($client['email'], 'Ze.EFE - nova senha temporária', $html, 'Sua nova senha temporária é: ' . $newPassword);
    } catch (Throwable $mailError) {
      error_log('Erro ao enviar e-mail de reset de senha: ' . $mailError->getMessage());
    }
  }

  echo json_encode(['success' => true, 'message' => 'Senha temporária gerada e enviada ao e-mail cadastrado.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

function gerarSenhaTemporaria(int $len = 8): string {
  $bytes = random_bytes($len);
  return substr(str_replace(['/', '+', '='], '', base64_encode($bytes)), 0, $len);
}

<?php
require_once __DIR__ . '/apiconfig.php';

function wants_json_adv(): bool {
  if (isset($_GET['format']) && $_GET['format'] === 'json') return true;
  $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
  return stripos($accept, 'application/json') !== false;
}

$token = trim($_GET['token'] ?? '');
if ($token === '') {
  if (wants_json_adv()) echo json_encode(['success'=>false,'error'=>'Token inválido.']);
  else render_html_adv('Token inválido.', false, true);
  exit;
}

try {
  $sel = $pdo->prepare('SELECT id, email_verified_at, verification_token_expires FROM advertisers WHERE verification_token = :t LIMIT 1');
  $sel->execute([':t'=>$token]);
  $adv = $sel->fetch(PDO::FETCH_ASSOC);
  if (!$adv) {
    if (wants_json_adv()) echo json_encode(['success'=>false,'error'=>'Token não encontrado.']);
    else render_html_adv('Token não encontrado.', false, true);
    exit;
  }
  if (!empty($adv['email_verified_at'])) {
    if (wants_json_adv()) echo json_encode(['success'=>true,'message'=>'E‑mail já verificado.']);
    else render_html_adv('Seu e‑mail já está verificado.', true, true);
    exit;
  }
  if (!empty($adv['verification_token_expires']) && (new DateTimeImmutable()) > new DateTimeImmutable($adv['verification_token_expires'])) {
    if (wants_json_adv()) echo json_encode(['success'=>false,'error'=>'Token expirado.']);
    else render_html_adv('Esse link expirou. Solicite um novo.', false, false);
    exit;
  }
  $upd = $pdo->prepare('UPDATE advertisers SET email_verified_at = NOW(), verification_token = NULL, verification_token_expires = NULL, updated_at = NOW() WHERE id = :id');
  $upd->execute([':id' => $adv['id']]);

  if (wants_json_adv()) echo json_encode(['success'=>true,'message'=>'E‑mail verificado com sucesso.']);
  else render_html_adv('E‑mail verificado com sucesso! Redirecionando…', true, true);
} catch (Throwable $e) {
  http_response_code(500);
  if (wants_json_adv()) echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
  else render_html_adv('Ocorreu um erro interno. Tente novamente.', false, false);
}

function render_html_adv(string $message, bool $ok, bool $autoRedirect) {
  header('Content-Type: text/html; charset=UTF-8');
  $portal = dirname($_SERVER['SCRIPT_NAME']) . '/../anunciante.html';
  $redirectMeta = $ok && $autoRedirect ? '<meta http-equiv="refresh" content="3;url=' . htmlspecialchars($portal) . '">' : '';
  echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">'
    . $redirectMeta
    . '<meta name="viewport" content="width=device-width, initial-scale=1">'
    . '<title>Ze.EFE - Verificação de e‑mail (Anunciante)</title>'
    . '<style>body{font-family:Arial,Helvetica,sans-serif;background:#F5F0E9;margin:0;padding:32px;color:#1D413A}
    .card{max-width:560px;margin:40px auto;background:#fff;border:1px solid rgba(29,65,58,.12);border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(29,65,58,.12)}
    h1{font-size:20px;margin:0 0 10px}
    p{margin:8px 0 16px;line-height:1.6}
    .ok{color:#1D413A}.err{color:#B54A3A}
    .btn{display:inline-block;background:#1D413A;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600}
    .hint{color:#8A7766;font-size:13px}
    </style></head><body><div class="card">'
    . '<h1>' . ($ok ? 'Tudo certo!' : 'Ops…') . '</h1>'
    . '<p class="' . ($ok ? 'ok' : 'err') . '">' . htmlspecialchars($message) . '</p>'
    . '<p><a class="btn" href="' . htmlspecialchars($portal) . '">Ir para o Portal do Anunciante</a></p>'
    . ($autoRedirect ? '<p class="hint">Você será redirecionado em alguns segundos.</p>' : '')
    . '</div></body></html>';
}


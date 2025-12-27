<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: text/html; charset=utf-8');

function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

$token = isset($_GET['token']) ? trim($_GET['token']) : '';
$ok = false; $msg = '';

try {
  if ($token === '') throw new Exception('Token inválido.');

  $stmt = $pdo->prepare('SELECT * FROM company_invitations WHERE token = :token LIMIT 1');
  $stmt->execute([':token' => $token]);
  $inv = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$inv) throw new Exception('Convite não encontrado.');
  if ($inv['status'] !== 'pendente') throw new Exception('Este convite não está mais disponível.');
  if (new DateTime($inv['expires_at']) < new DateTime()) throw new Exception('Convite expirado.');

  // Se já existir cliente com o e-mail/CPF, vincula; caso contrário apenas marca aceito e orienta cadastro
  $linked = false;
  try {
    $email = trim((string)($inv['invite_email'] ?? ''));
    $cpfDigits = preg_replace('/\D/','', (string)($inv['cpf'] ?? ''));
    if ($email !== '' || $cpfDigits !== '') {
      $q = $pdo->prepare('SELECT id FROM clients WHERE email = :email OR REPLACE(REPLACE(REPLACE(cpf, ".", ""), "-", ""), " ", "") = :cpf LIMIT 1');
      $q->execute([':email'=>$email, ':cpf'=>$cpfDigits]);
      if ($row = $q->fetch(PDO::FETCH_ASSOC)) {
        try {
          $upd = $pdo->prepare('UPDATE clients SET company_id = :cid, company_role = :role, updated_at = NOW() WHERE id = :client');
          $upd->execute([':cid' => $inv['company_id'], ':role' => $inv['role'], ':client' => $row['id']]);
        } catch (Throwable $e) {
          $upd = $pdo->prepare('UPDATE clients SET company_id = :cid, updated_at = NOW() WHERE id = :client');
          $upd->execute([':cid' => $inv['company_id'], ':client' => $row['id']]);
        }
        $linked = true;
      }
    }
  } catch (Throwable $e) { /* ignore */ }

  // Marca convite como aceito
  $acc = $pdo->prepare("UPDATE company_invitations SET status='aceito', accepted_at = NOW() WHERE id = :id");
  $acc->execute([':id' => $inv['id']]);
  $ok = true;
  $msg = $linked
    ? 'Convite aceito e vínculo realizado. Acesse a Área do Cliente.'
    : 'Convite aceito. Crie seu acesso no portal para concluir o vínculo.';
} catch (Throwable $e) {
  $ok = false; $msg = $e->getMessage();
}

?><!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Convite de empresa — Ze.EFE</title>
  <style>
    body{margin:0;background:#F5F0E9;font-family:Inter,system-ui,Arial,sans-serif;color:#1D413A}
    .wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{background:#fff;border-radius:12px;box-shadow:0 6px 22px rgba(0,0,0,.08);padding:28px;max-width:520px;width:100%;text-align:center}
    .card h1{font-size:20px;margin:0 0 12px}
    .ok{color:#2F6F55}
    .err{color:#B54A3A}
    .btn{display:inline-block;margin-top:18px;background:#1D413A;color:#F5F0E9;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600}
  </style>
  <link rel="icon" href="/favicon.ico" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
</head>
<body>
  <div class="wrap">
    <div class="card">
      <img src="/img/logo.jpg" alt="Ze.EFE" style="width:120px;margin-bottom:8px"/>
      <h1 class="<?= $ok ? 'ok' : 'err' ?>"><?= $ok ? 'Convite aceito' : 'Não foi possível aceitar' ?></h1>
      <p><?= h($msg) ?></p>
      <p><a class="btn" href="/clientes.html">Ir para Área do Cliente</a></p>
    </div>
  </div>
</body>
</html>

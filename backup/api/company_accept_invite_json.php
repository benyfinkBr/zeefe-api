<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $token = isset($_GET['token']) ? trim($_GET['token']) : '';
  if ($token === '') { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Token inválido']); exit; }

  $stmt = $pdo->prepare('SELECT * FROM company_invitations WHERE token = :token LIMIT 1');
  $stmt->execute([':token' => $token]);
  $inv = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$inv) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Convite não encontrado']); exit; }
  if ($inv['status'] !== 'pendente') { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Convite indisponível']); exit; }
  if (new DateTime($inv['expires_at']) < new DateTime()) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Convite expirado']); exit; }

  $linked = false; $clientId = null;
  try {
    $email = trim((string)($inv['invite_email'] ?? ''));
    $cpfDigits = preg_replace('/\D/','', (string)($inv['cpf'] ?? ''));
    if ($email !== '' || $cpfDigits !== '') {
      $q = $pdo->prepare('SELECT id FROM clients WHERE email = :email OR REPLACE(REPLACE(REPLACE(cpf, ".", ""), "-", ""), " ", "") = :cpf LIMIT 1');
      $q->execute([':email'=>$email, ':cpf'=>$cpfDigits]);
      if ($row = $q->fetch(PDO::FETCH_ASSOC)) {
        $clientId = (int)$row['id'];
        try {
          $upd = $pdo->prepare('UPDATE clients SET company_id = :cid, company_role = :role, updated_at = NOW() WHERE id = :client');
          $upd->execute([':cid' => $inv['company_id'], ':role' => $inv['role'], ':client' => $clientId]);
        } catch (Throwable $e) {
          $upd = $pdo->prepare('UPDATE clients SET company_id = :cid, updated_at = NOW() WHERE id = :client');
          $upd->execute([':cid' => $inv['company_id'], ':client' => $clientId]);
        }
        $linked = true;
      }
    }
  } catch (Throwable $e) { /* ignore */ }

  $acc = $pdo->prepare("UPDATE company_invitations SET status='aceito', accepted_at = NOW() WHERE id = :id");
  $acc->execute([':id' => $inv['id']]);

  echo json_encode(['success'=>true,'linked'=>$linked,'client_id'=>$clientId]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


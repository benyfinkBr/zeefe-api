<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $advertiserId = isset($data['advertiser_id']) ? (int)$data['advertiser_id'] : 0;
  $ownerType = trim($data['owner_type'] ?? '');
  $ownerId   = isset($data['owner_id']) ? (int)$data['owner_id'] : 0;
  $bank = trim($data['bank_name'] ?? '');
  $accType = trim($data['account_type'] ?? '');
  $accNum  = trim($data['account_number'] ?? '');
  $pixKey  = trim($data['pix_key'] ?? '');

  if ($advertiserId <= 0 && ($ownerType === '' || $ownerId <= 0)) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Informe advertiser_id ou owner_type/owner_id']);
    exit;
  }

  if ($advertiserId <= 0) {
    // Cria advertiser se não existir
    $check = $pdo->prepare('SELECT id FROM advertisers WHERE owner_type = :t AND owner_id = :o LIMIT 1');
    $check->execute([':t'=>$ownerType, ':o'=>$ownerId]);
    if ($row = $check->fetch(PDO::FETCH_ASSOC)) {
      $advertiserId = (int)$row['id'];
    } else {
      $ins = $pdo->prepare('INSERT INTO advertisers (owner_type, owner_id, display_name, status, created_at) VALUES (:t,:o,NULL, "ativo", NOW())');
      $ins->execute([':t'=>$ownerType, ':o'=>$ownerId]);
      $advertiserId = (int)$pdo->lastInsertId();
    }
  }

  $upd = $pdo->prepare('UPDATE advertisers SET bank_name = :b, account_type = :at, account_number = :an, pix_key = :pk, updated_at = NOW() WHERE id = :id');
  $upd->execute([':b'=>$bank, ':at'=>$accType, ':an'=>$accNum, ':pk'=>$pixKey, ':id'=>$advertiserId]);

  $sel = $pdo->prepare('SELECT * FROM advertisers WHERE id = :id LIMIT 1');
  $sel->execute([':id'=>$advertiserId]);
  $adv = $sel->fetch(PDO::FETCH_ASSOC) ?: null;

  echo json_encode(['success'=>true,'advertiser'=>$adv]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


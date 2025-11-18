<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $advertiserId = isset($data['advertiser_id']) ? (int)$data['advertiser_id'] : 0;
  $ownerType = trim($data['owner_type'] ?? '');
  $ownerId   = isset($data['owner_id']) ? (int)$data['owner_id'] : 0;
  $bankCode = trim($data['bank_code'] ?? '');
  $bank = trim($data['bank_name'] ?? '');
  $accType = trim($data['account_type'] ?? '');
  $agency = trim($data['agency_number'] ?? '');
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

  // Monta SQL dinâmico para atualizar apenas colunas existentes
  $cols = [];$params=[':id'=>$advertiserId];
  try {
    $desc = $pdo->query("DESCRIBE advertisers")->fetchAll(PDO::FETCH_COLUMN,0);
    $has = function($c) use($desc){ return in_array($c, $desc, true); };
    if ($has('bank_code')) { $cols[]='bank_code = :bc'; $params[':bc']=$bankCode; }
    if ($has('bank_name')) { $cols[]='bank_name = :bn'; $params[':bn']=$bank; }
    if ($has('account_type')) { $cols[]='account_type = :at'; $params[':at']=$accType; }
    if ($has('agency_number')) { $cols[]='agency_number = :ag'; $params[':ag']=$agency; }
    if ($has('account_number')) { $cols[]='account_number = :an'; $params[':an']=$accNum; }
    if ($has('pix_key')) { $cols[]='pix_key = :pk'; $params[':pk']=$pixKey; }
  } catch (Throwable $e) {
    // fallback mínimo
    $cols = ['bank_name = :bn','account_type = :at','account_number = :an','pix_key = :pk'];
    $params = array_merge($params, [':bn'=>$bank, ':at'=>$accType, ':an'=>$accNum, ':pk'=>$pixKey]);
  }
  if ($cols) {
    $sqlUpd = 'UPDATE advertisers SET '.implode(',', $cols).', updated_at = NOW() WHERE id = :id';
    $upd = $pdo->prepare($sqlUpd); $upd->execute($params);
  }

  $sel = $pdo->prepare('SELECT * FROM advertisers WHERE id = :id LIMIT 1');
  $sel->execute([':id'=>$advertiserId]);
  $adv = $sel->fetch(PDO::FETCH_ASSOC) ?: null;

  echo json_encode(['success'=>true,'advertiser'=>$adv]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

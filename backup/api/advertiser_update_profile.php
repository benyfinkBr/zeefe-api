<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $id = isset($data['id']) ? (int)$data['id'] : 0;
  if ($id <= 0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'ID inválido']); exit; }

  $fields = [
    'display_name' => isset($data['display_name']) ? trim($data['display_name']) : null,
    'contact_phone' => isset($data['contact_phone']) ? preg_replace('/\D/', '', (string)$data['contact_phone']) : null,
  ];
  $set = [];$vals=[];
  foreach ($fields as $k=>$v) {
    if ($v !== null) { $set[] = "$k = :$k"; $vals[":$k"] = $v; }
  }
  if (!$set) { echo json_encode(['success'=>true]); exit; }
  $vals[':id'] = $id;
  $sql = 'UPDATE advertisers SET '.implode(',', $set).', updated_at = NOW() WHERE id = :id';
  $stmt = $pdo->prepare($sql); $stmt->execute($vals);

  $sel = $pdo->prepare('SELECT * FROM advertisers WHERE id = :id LIMIT 1');
  $sel->execute([':id'=>$id]);
  $adv = $sel->fetch(PDO::FETCH_ASSOC) ?: null;
  echo json_encode(['success'=>true,'advertiser'=>$adv]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


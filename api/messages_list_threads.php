<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $advertiserId = isset($_GET['advertiser_id']) ? (int)$_GET['advertiser_id'] : 0;
  $clientId     = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;
  if ($advertiserId <= 0 && $clientId <= 0) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Informe advertiser_id ou client_id']);
    exit;
  }
  $sql = 'SELECT * FROM message_threads WHERE 1=1';
  $p = [];
  if ($advertiserId > 0) { $sql .= ' AND advertiser_id = :adv'; $p[':adv'] = $advertiserId; }
  if ($clientId > 0)     { $sql .= ' AND client_id = :cli';     $p[':cli'] = $clientId; }
  $sql .= ' ORDER BY COALESCE(last_message_at, created_at) DESC';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($p);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  echo json_encode(['success'=>true,'data'=>$rows]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


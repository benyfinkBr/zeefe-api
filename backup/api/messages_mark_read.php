<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $threadId = isset($data['thread_id']) ? (int)$data['thread_id'] : 0;
  $who      = trim($data['who'] ?? ''); // client|advertiser
  if ($threadId<=0 || ($who!=='client' && $who!=='advertiser')) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Parâmetros inválidos']); exit; }
  $col = $who==='client' ? 'read_by_client_at' : 'read_by_advertiser_at';
  $upd = $pdo->prepare("UPDATE messages SET $col = NOW() WHERE thread_id = :t AND $col IS NULL");
  $upd->execute([':t'=>$threadId]);
  echo json_encode(['success'=>true,'updated'=>$upd->rowCount()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $threadId = isset($_GET['thread_id']) ? (int)$_GET['thread_id'] : 0;
  if ($threadId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'thread_id inválido']); exit; }
  $stmt = $pdo->prepare('SELECT * FROM messages WHERE thread_id = :id ORDER BY created_at ASC');
  $stmt->execute([':id'=>$threadId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  echo json_encode(['success'=>true,'data'=>$rows]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


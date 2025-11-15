<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $threadId = isset($data['thread_id']) ? (int)$data['thread_id'] : 0;
  $sender   = trim($data['sender_type'] ?? ''); // client|advertiser|system
  $body     = trim($data['body'] ?? '');
  if ($threadId <= 0 || $sender === '' || $body === '') {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Dados inválidos']);
    exit;
  }
  $ins = $pdo->prepare('INSERT INTO messages (thread_id, sender_type, body, created_at) VALUES (:t,:s,:b,NOW())');
  $ins->execute([':t'=>$threadId, ':s'=>$sender, ':b'=>$body]);
  $upd = $pdo->prepare('UPDATE message_threads SET last_message_at = NOW() WHERE id = :id');
  $upd->execute([':id'=>$threadId]);
  echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


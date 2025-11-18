<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $threadId = isset($_GET['thread_id']) ? (int)$_GET['thread_id'] : 0;
  if ($threadId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'thread_id inválido']); exit; }

  // Optional participant check (does not break existing callers)
  $clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;
  $advertiserId = isset($_GET['advertiser_id']) ? (int)$_GET['advertiser_id'] : 0;
  if ($clientId > 0 || $advertiserId > 0) {
    $q = $pdo->prepare('SELECT client_id, advertiser_id FROM message_threads WHERE id = :id');
    $q->execute([':id' => $threadId]);
    $thr = $q->fetch(PDO::FETCH_ASSOC);
    if (!$thr) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Thread não encontrada']); exit; }
    if ($clientId > 0 && (int)$thr['client_id'] !== $clientId) { http_response_code(403); echo json_encode(['success'=>false,'error'=>'Acesso negado']); exit; }
    if ($advertiserId > 0 && (int)$thr['advertiser_id'] !== $advertiserId) { http_response_code(403); echo json_encode(['success'=>false,'error'=>'Acesso negado']); exit; }
  }

  $stmt = $pdo->prepare('SELECT * FROM messages WHERE thread_id = :id ORDER BY created_at ASC');
  $stmt->execute([':id'=>$threadId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  echo json_encode(['success'=>true,'data'=>$rows]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
  if ($roomId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'room_id inválido']); exit; }
  $stmt = $pdo->prepare('SELECT * FROM reviews WHERE room_id = :r AND status <> "oculto" ORDER BY created_at DESC');
  $stmt->execute([':r'=>$roomId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  echo json_encode(['success'=>true,'data'=>$rows]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


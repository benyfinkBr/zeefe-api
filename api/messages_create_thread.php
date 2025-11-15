<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $roomId = isset($data['room_id']) ? (int)$data['room_id'] : null;
  $reservationId = isset($data['reservation_id']) ? (int)$data['reservation_id'] : null;
  $clientId = isset($data['client_id']) ? (int)$data['client_id'] : 0;
  $advertiserId = isset($data['advertiser_id']) ? (int)$data['advertiser_id'] : 0;
  if ($clientId<=0 || $advertiserId<=0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Informe client_id e advertiser_id']); exit; }
  $ins = $pdo->prepare('INSERT INTO message_threads (room_id, reservation_id, client_id, advertiser_id, created_at) VALUES (:r,:res,:c,:a,NOW())');
  $ins->execute([':r'=>$roomId, ':res'=>$reservationId, ':c'=>$clientId, ':a'=>$advertiserId]);
  echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


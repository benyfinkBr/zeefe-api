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

  // Validate consistency when reservation_id or room_id is provided
  if ($reservationId && $reservationId > 0) {
    $q = $pdo->prepare('SELECT r.client_id, r.room_id, rooms.advertiser_id FROM reservations r JOIN rooms ON rooms.id = r.room_id WHERE r.id = :id LIMIT 1');
    $q->execute([':id' => $reservationId]);
    $res = $q->fetch(PDO::FETCH_ASSOC);
    if (!$res) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Reserva não encontrada']); exit; }
    if ((int)$res['client_id'] !== $clientId) { http_response_code(403); echo json_encode(['success'=>false,'error'=>'Cliente não pertence à reserva']); exit; }
    if ((int)$res['advertiser_id'] !== $advertiserId) { http_response_code(403); echo json_encode(['success'=>false,'error'=>'Anunciante não pertence à reserva']); exit; }
    // Override roomId from reservation to avoid inconsistencies
    $roomId = (int)$res['room_id'];
  } elseif ($roomId && $roomId > 0) {
    $q = $pdo->prepare('SELECT advertiser_id FROM rooms WHERE id = :id');
    $q->execute([':id' => $roomId]);
    $r = $q->fetch(PDO::FETCH_ASSOC);
    if (!$r) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Sala não encontrada']); exit; }
    if ((int)$r['advertiser_id'] !== $advertiserId) { http_response_code(403); echo json_encode(['success'=>false,'error'=>'Sala não pertence ao anunciante']); exit; }
  }
  $ins = $pdo->prepare('INSERT INTO message_threads (room_id, reservation_id, client_id, advertiser_id, created_at) VALUES (:r,:res,:c,:a,NOW())');
  $ins->execute([':r'=>$roomId, ':res'=>$reservationId, ':c'=>$clientId, ':a'=>$advertiserId]);
  echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

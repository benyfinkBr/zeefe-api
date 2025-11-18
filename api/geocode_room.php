<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/geocode.php';
header('Content-Type: application/json');

try {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $roomId = isset($input['room_id']) ? (int)$input['room_id'] : (int)($_GET['room_id'] ?? 0);
  if ($roomId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'room_id inválido']); exit; }
  $s = $pdo->prepare('SELECT * FROM rooms WHERE id = ? LIMIT 1');
  $s->execute([$roomId]);
  $row = $s->fetch(PDO::FETCH_ASSOC);
  if (!$row) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Sala não encontrada']); exit; }
  $ok = attempt_room_geocode($pdo, $roomId, $row);
  echo json_encode(['success'=>$ok, 'lat'=>$ok?($row['lat']??null):null, 'lon'=>$ok?($row['lon']??null):null]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


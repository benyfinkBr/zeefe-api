<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

function clamp($n){ $n=(int)$n; if($n<1)$n=1; if($n>5)$n=5; return $n; }

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $reservationId = isset($data['reservation_id']) ? (int)$data['reservation_id'] : 0;
  $roomId = isset($data['room_id']) ? (int)$data['room_id'] : 0;
  $clientId = isset($data['client_id']) ? (int)$data['client_id'] : 0;
  $rp = clamp($data['rating_price'] ?? 0);
  $rb = clamp($data['rating_benefits'] ?? 0);
  $re = clamp($data['rating_ease'] ?? 0);
  $comment = trim($data['comment'] ?? '');
  $recom = isset($data['recommend']) ? (int)!!$data['recommend'] : null;
  if ($reservationId<=0 || $roomId<=0 || $clientId<=0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Dados inválidos']); exit; }
  // Uma por reserva
  $chk = $pdo->prepare('SELECT id FROM reviews WHERE reservation_id = :r LIMIT 1');
  $chk->execute([':r'=>$reservationId]);
  if ($chk->fetch()) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Avaliação já enviada para esta reserva']); exit; }
  $ins = $pdo->prepare('INSERT INTO reviews (reservation_id, room_id, client_id, rating_price, rating_benefits, rating_ease, comment, recommend, status, created_at) VALUES (:res,:room,:cli,:rp,:rb,:re,:c,:rec, "aprovado", NOW())');
  $ins->execute([':res'=>$reservationId, ':room'=>$roomId, ':cli'=>$clientId, ':rp'=>$rp, ':rb'=>$rb, ':re'=>$re, ':c'=>$comment, ':rec'=>$recom]);
  echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


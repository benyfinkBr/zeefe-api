<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
  if ($roomId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'room_id inválido']); exit; }
  // Calcula on-the-fly
  $stmt = $pdo->prepare('SELECT rating_price, rating_benefits, rating_ease FROM reviews WHERE room_id = :r AND status = "aprovado"');
  $stmt->execute([':r'=>$roomId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  $n = count($rows); $avgP=0; $avgB=0; $avgE=0;
  foreach ($rows as $rv) { $avgP += (int)$rv['rating_price']; $avgB += (int)$rv['rating_benefits']; $avgE += (int)$rv['rating_ease']; }
  if ($n>0) { $avgP/=$n; $avgB/=$n; $avgE/=$n; }
  $overall = $n>0 ? round(($avgB + $avgE + $avgP)/3, 2) : 0.0;
  echo json_encode(['success'=>true,'data'=>[
    'room_id'=>$roomId,
    'avg_overall'=>round($overall,2),
    'avg_price'=>round($avgP,2),
    'avg_benefits'=>round($avgB,2),
    'avg_ease'=>round($avgE,2),
    'reviews_count'=>$n
  ]]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


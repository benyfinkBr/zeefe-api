<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/geocode.php';
header('Content-Type: application/json');

try {
  $s = $pdo->query('SELECT id, street, complement, city, state, cep, lat, lon FROM rooms WHERE (lat IS NULL OR lon IS NULL)');
  $rows = $s->fetchAll(PDO::FETCH_ASSOC) ?: [];
  $updated = 0; $attempted = 0;
  foreach ($rows as $row) {
    $attempted++;
    if (!empty($row['cep']) || (!empty($row['city']) && !empty($row['state']))) {
      if (attempt_room_geocode($pdo, (int)$row['id'], $row)) { $updated++; }
      usleep(500000); // 0.5s por respeito ao provedor
    }
  }
  echo json_encode(['success'=>true,'attempted'=>$attempted,'updated'=>$updated]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}


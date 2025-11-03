<?php
require 'apiconfig.php';

$roomId = isset($_GET['room_id']) ? (int) $_GET['room_id'] : 0;
if ($roomId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Sala inválida.']);
  exit;
}

try {
  $sql = "
    SELECT r.id,
           r.date,
           r.time_start,
           r.time_end,
           r.status,
           r.title,
           r.description,
           r.notes,
           c.name AS client_name
    FROM reservations r
    LEFT JOIN clients c ON c.id = r.client_id
    WHERE r.room_id = :room
    ORDER BY r.date DESC, r.time_start ASC
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':room' => $roomId]);
  $rows = $stmt->fetchAll();

  echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

<?php
require_once __DIR__ . '/../apiconfig.php';
require_once __DIR__ . '/../lib/workshop_payments.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $sql = "
    SELECT w.id,
           w.min_seats,
           (SELECT COUNT(*) FROM workshop_enrollments e WHERE e.workshop_id = w.id AND e.payment_status <> 'cancelado') AS active_seats
    FROM workshops w
    WHERE w.status = 'publicado' AND w.min_seats > 0
  ";
  $stmt = $pdo->query($sql);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $results = [];
  foreach ($rows as $row) {
    $minSeats = (int)($row['min_seats'] ?? 0);
    $activeSeats = (int)($row['active_seats'] ?? 0);
    if ($minSeats > 0 && $activeSeats >= $minSeats) {
      $results[] = [
        'workshop_id' => (int)$row['id'],
        'result' => workshop_charge_pending($pdo, (int)$row['id'])
      ];
    }
  }

  echo json_encode(['success' => true, 'charged' => $results]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

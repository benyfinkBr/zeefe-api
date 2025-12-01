<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $status = $_GET['status'] ?? 'publicado';
  $advertiserId = isset($_GET['advertiser_id']) ? (int) $_GET['advertiser_id'] : null;
  $upcoming = isset($_GET['upcoming']) ? (int) $_GET['upcoming'] : 1;
  $workshopId = isset($_GET['id']) ? (int) $_GET['id'] : null;
  $includePast = isset($_GET['include_past']) ? (int) $_GET['include_past'] : 0;

  $conditions = [];
  $params = [];

  if ($status !== '') {
    $conditions[] = 'w.status = :status';
    $params[':status'] = preg_replace('/[^a-z_]/', '', $status);
  }

  if ($advertiserId) {
    $conditions[] = 'w.advertiser_id = :advertiser_id';
    $params[':advertiser_id'] = $advertiserId;
  }

  if ($workshopId) {
    $conditions[] = 'w.id = :workshop_id';
    $params[':workshop_id'] = $workshopId;
    $upcoming = 0; // garante busca mesmo se o evento já passou
  }

  if ($upcoming && !$includePast) {
    $today = (new DateTimeImmutable('today'))->format('Y-m-d');
    $conditions[] = 'w.date >= :today';
    $params[':today'] = $today;
  }

  $sql = "
    SELECT
      w.*,
      r.name  AS room_name,
      r.city  AS room_city,
      r.state AS room_state,
      a.display_name AS advertiser_name,
      (
        SELECT COUNT(*)
        FROM workshop_enrollments e
        WHERE e.workshop_id = w.id
          AND e.payment_status = 'pago'
      ) AS sold_seats
    FROM workshops w
    JOIN rooms r        ON r.id = w.room_id
    LEFT JOIN advertisers a ON a.id = w.advertiser_id
  ";

  if ($conditions) {
    $sql .= ' WHERE ' . implode(' AND ', $conditions);
  }

  $sql .= ' ORDER BY w.date ASC, w.time_start ASC';

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll();

  echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $advertiserId = isset($_GET['advertiser_id']) ? (int) $_GET['advertiser_id'] : 0;
  $workshopId   = isset($_GET['workshop_id']) ? (int) $_GET['workshop_id'] : 0;

  if ($advertiserId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
    exit;
  }

  $conditions = ['w.advertiser_id = :advertiser_id'];
  $params = [':advertiser_id' => $advertiserId];

  if ($workshopId > 0) {
    $conditions[] = 'e.workshop_id = :workshop_id';
    $params[':workshop_id'] = $workshopId;
  }

  $sql = "
    SELECT
      e.*,
      w.title           AS workshop_title,
      w.date            AS workshop_date,
      w.time_start      AS workshop_time_start,
      p.name            AS participant_name,
      p.email           AS participant_email,
      p.cpf             AS participant_cpf,
      p.phone           AS participant_phone
    FROM workshop_enrollments e
    JOIN workshops w            ON w.id = e.workshop_id
    JOIN workshop_participants p ON p.id = e.participant_id
    WHERE " . implode(' AND ', $conditions) . "
    ORDER BY w.date ASC, e.created_at ASC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(['success' => true, 'data' => $rows]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}


<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $clientId = isset($_GET['client_id']) ? (int) $_GET['client_id'] : 0;
  if ($clientId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Cliente inválido.']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT name, email, cpf FROM clients WHERE id = ? LIMIT 1');
  $stmt->execute([$clientId]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    echo json_encode(['success' => true, 'data' => []]);
    exit;
  }

  $email = trim($client['email'] ?? '');
  $cpf = preg_replace('/\D/', '', $client['cpf'] ?? '');

  $matchers = [];
  $params = [];
  if ($email !== '') {
    $matchers[] = 'p.email = :email';
    $params[':email'] = $email;
  }
  if ($cpf !== '') {
    $matchers[] = 'p.cpf = :cpf';
    $params[':cpf'] = $cpf;
  }

  if (!$matchers) {
    echo json_encode(['success' => true, 'data' => []]);
    exit;
  }

  $conditionsSql = implode(' OR ', array_map(fn($cond) => '(' . $cond . ')', $matchers));

  $sql = "
    SELECT
      e.*,
      w.title        AS workshop_title,
      w.subtitle     AS workshop_subtitle,
      w.date         AS workshop_date,
      w.end_date     AS workshop_end_date,
      w.time_start   AS workshop_time_start,
      w.time_end     AS workshop_time_end,
      w.price_per_seat,
      w.min_seats,
      w.max_seats,
      w.banner_path,
      w.show_sold_bar,
      r.name         AS room_name,
      r.city         AS room_city,
      r.state        AS room_state,
      (
        SELECT COUNT(*)
        FROM workshop_enrollments e2
        WHERE e2.workshop_id = w.id
          AND e2.payment_status = 'pago'
      ) AS paid_seats
    FROM workshop_enrollments e
    JOIN workshops w            ON w.id = e.workshop_id
    JOIN workshop_participants p ON p.id = e.participant_id
    JOIN rooms r                ON r.id = w.room_id
    WHERE {$conditionsSql}
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

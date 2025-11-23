<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $code = $_GET['code'] ?? '';
  $code = preg_replace('/[^A-Za-z0-9]/', '', $code);

  if ($code === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Código inválido.']);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT e.*, w.title, w.date, w.time_start, w.time_end, p.name AS participant_name
    FROM workshop_enrollments e
    JOIN workshops w ON w.id = e.workshop_id
    JOIN workshop_participants p ON p.id = e.participant_id
    WHERE e.public_code = ?
    LIMIT 1
  ');
  $stmt->execute([$code]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Ingresso não encontrado.']);
    exit;
  }

  if ($row['payment_status'] !== 'pago') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Pagamento ainda não confirmado para este ingresso.']);
    exit;
  }

  if ($row['checkin_status'] === 'lido') {
    echo json_encode([
      'success' => true,
      'already_checked' => true,
      'checked_in_at' => $row['checked_in_at'],
      'participant_name' => $row['participant_name'],
      'workshop_title' => $row['title'],
      'date' => $row['date'],
      'time_start' => $row['time_start'],
      'time_end' => $row['time_end'],
    ]);
    exit;
  }

  $upd = $pdo->prepare('UPDATE workshop_enrollments SET checkin_status = \'lido\', checked_in_at = NOW() WHERE id = ?');
  $upd->execute([$row['id']]);

  echo json_encode([
    'success' => true,
    'already_checked' => false,
    'participant_name' => $row['participant_name'],
    'workshop_title' => $row['title'],
    'date' => $row['date'],
    'time_start' => $row['time_start'],
    'time_end' => $row['time_end'],
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}


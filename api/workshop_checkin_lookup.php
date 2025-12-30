<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $codeRaw = $_GET['code'] ?? '';
  $publicCode = preg_replace('/[^A-Za-z0-9]/', '', $codeRaw);

  if ($publicCode === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Codigo invalido.']);
    exit;
  }

  $sql = '
    SELECT
      e.id,
      e.public_code,
      e.payment_status,
      e.checkin_status,
      w.title AS workshop_title,
      w.date AS workshop_date,
      w.time_start AS workshop_time_start,
      w.time_end AS workshop_time_end,
      p.name AS participant_name,
      p.cpf AS participant_cpf,
      p.email AS participant_email,
      p.phone AS participant_phone
    FROM workshop_enrollments e
    JOIN workshops w ON w.id = e.workshop_id
    JOIN workshop_participants p ON p.id = e.participant_id
    WHERE e.public_code = :code
    LIMIT 1
  ';
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':code' => $publicCode]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Ingresso nao encontrado.']);
    exit;
  }

  if ($row['payment_status'] !== 'pago') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Pagamento ainda nao confirmado.']);
    exit;
  }

  $timeLabel = trim(($row['workshop_time_start'] ?? '') . ' - ' . ($row['workshop_time_end'] ?? ''));

  echo json_encode([
    'success' => true,
    'data' => [
      'id' => (int)$row['id'],
      'public_code' => $row['public_code'],
      'payment_status' => $row['payment_status'],
      'checkin_status' => $row['checkin_status'],
      'workshop_title' => $row['workshop_title'],
      'workshop_date' => $row['workshop_date'],
      'workshop_time' => $timeLabel,
      'participant_name' => $row['participant_name'],
      'participant_cpf' => $row['participant_cpf'],
      'participant_email' => $row['participant_email'],
      'participant_phone' => $row['participant_phone']
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

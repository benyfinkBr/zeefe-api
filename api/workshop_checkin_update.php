<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $body = json_decode(file_get_contents('php://input'), true);
  if (!$body) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Requisição inválida.']);
    exit;
  }

  $enrollmentId = isset($body['enrollment_id']) ? (int)$body['enrollment_id'] : 0;
  $publicCode = preg_replace('/[^A-Za-z0-9]/', '', $body['public_code'] ?? '');
  $action = strtolower(trim((string)($body['action'] ?? '')));
  if (!in_array($action, ['confirm', 'deny'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ação inválida.']);
    exit;
  }

  if ($enrollmentId <= 0 && $publicCode === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ingresso inválido.']);
    exit;
  }

  $sql = '
    SELECT e.*, p.name AS participant_name, p.cpf AS participant_cpf, p.email AS participant_email, p.phone AS participant_phone
    FROM workshop_enrollments e
    JOIN workshop_participants p ON p.id = e.participant_id
    WHERE ' . ($enrollmentId > 0 ? 'e.id = :id' : 'e.public_code = :code') . '
    LIMIT 1
  ';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($enrollmentId > 0 ? [':id' => $enrollmentId] : [':code' => $publicCode]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Ingresso não encontrado.']);
    exit;
  }

  if ($row['payment_status'] !== 'pago') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Pagamento ainda não confirmado.']);
    exit;
  }

  if ($action === 'confirm') {
    $upd = $pdo->prepare('UPDATE workshop_enrollments SET checkin_status = \'lido\', checked_in_at = NOW() WHERE id = ?');
    $upd->execute([$row['id']]);
  } else {
    $upd = $pdo->prepare('UPDATE workshop_enrollments SET checkin_status = \'cancelado\', checked_in_at = NULL WHERE id = ?');
    $upd->execute([$row['id']]);
  }

  echo json_encode([
    'success' => true,
    'action' => $action,
    'participant_name' => $row['participant_name'],
    'participant_cpf' => $row['participant_cpf'],
    'participant_email' => $row['participant_email'],
    'participant_phone' => $row['participant_phone']
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

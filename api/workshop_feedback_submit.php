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

  $publicCode = preg_replace('/[^A-Za-z0-9]/', '', $body['public_code'] ?? '');
  $ratingEvent = (int)($body['rating_event'] ?? 0);
  $ratingPlatform = (int)($body['rating_platform'] ?? 0);
  $commentsEvent = trim((string)($body['comments_event'] ?? ''));
  $commentsPlatform = trim((string)($body['comments_platform'] ?? ''));
  $isPublic = !empty($body['is_public']) ? 1 : 0;

  if ($publicCode === '' || $ratingEvent < 1 || $ratingEvent > 5 || $ratingPlatform < 1 || $ratingPlatform > 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Informe avaliações válidas.']);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT e.id, e.workshop_id, p.id AS participant_id, p.name AS participant_name
    FROM workshop_enrollments e
    JOIN workshop_participants p ON p.id = e.participant_id
    WHERE e.public_code = ?
    LIMIT 1
  ');
  $stmt->execute([$publicCode]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Ingresso não encontrado.']);
    exit;
  }

  $chk = $pdo->prepare('SELECT id FROM workshop_feedback WHERE workshop_id = ? AND participant_id = ? LIMIT 1');
  $chk->execute([$row['workshop_id'], $row['participant_id']]);
  if ($chk->fetchColumn()) {
    echo json_encode(['success' => true, 'message' => 'Feedback já registrado.']);
    exit;
  }

  $ins = $pdo->prepare('
    INSERT INTO workshop_feedback
      (workshop_id, participant_id, participant_name, rating_event, rating_platform, comments_event, comments_platform, is_public)
    VALUES (?,?,?,?,?,?,?,?)
  ');
  $ins->execute([
    $row['workshop_id'],
    $row['participant_id'],
    $row['participant_name'],
    $ratingEvent,
    $ratingPlatform,
    $commentsEvent ?: null,
    $commentsPlatform ?: null,
    $isPublic
  ]);

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

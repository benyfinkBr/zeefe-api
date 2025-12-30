<?php
require_once __DIR__ . '/../apiconfig.php';
require_once __DIR__ . '/../lib/mailer.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $today = (new DateTimeImmutable('today'))->format('Y-m-d');
  $sql = "
    SELECT e.public_code, p.name AS participant_name, p.email AS participant_email, w.title AS workshop_title
    FROM workshop_enrollments e
    JOIN workshop_participants p ON p.id = e.participant_id
    JOIN workshops w ON w.id = e.workshop_id
    LEFT JOIN workshop_feedback f ON f.workshop_id = e.workshop_id AND f.participant_id = e.participant_id
    WHERE e.payment_status = 'pago'
      AND w.status = 'concluido'
      AND w.date < :today
      AND f.id IS NULL
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':today' => $today]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $sent = 0;
  foreach ($rows as $row) {
    if (empty($row['participant_email']) || empty($row['public_code'])) {
      continue;
    }
    $reviewUrl = 'https://zeefe.com.br/workshop_review.html?code=' . urlencode($row['public_code']);
    $html = mailer_render('workshop_review_request.php', [
      'participant_name' => $row['participant_name'] ?? 'Participante',
      'workshop_title' => $row['workshop_title'] ?? 'Workshop',
      'review_url' => $reviewUrl
    ]);
    if (mailer_send([['email' => $row['participant_email'], 'name' => $row['participant_name'] ?? '']], 'Avalie seu workshop', $html)) {
      $sent++;
    }
  }

  echo json_encode(['success' => true, 'sent' => $sent]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

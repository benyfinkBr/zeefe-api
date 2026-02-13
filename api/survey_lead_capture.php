<?php
require_once 'apiconfig.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
  exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
$token = trim((string) ($payload['token'] ?? ''));
$email = mb_strtolower(trim((string) ($payload['email'] ?? '')));

if ($token === '' || $email === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'E-mail inválido.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT id, title, lead_origin FROM surveys WHERE token = :token AND status = "ativo" LIMIT 1');
  $stmt->execute([':token' => $token]);
  $survey = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$survey) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Pesquisa não encontrada.']);
    exit;
  }

  $origin = trim((string) ($survey['lead_origin'] ?? ''));
  if ($origin === '') {
    $origin = 'Pesquisa ' . trim((string) ($survey['title'] ?? ''));
    if ($origin === 'Pesquisa') $origin = 'Pesquisa #' . (int) $survey['id'];
  }

  $insert = $pdo->prepare(
    'INSERT INTO survey_leads (survey_id, email, origin) VALUES (:sid, :email, :origin)
     ON DUPLICATE KEY UPDATE origin = VALUES(origin), updated_at = CURRENT_TIMESTAMP'
  );
  $insert->execute([
    ':sid' => (int) $survey['id'],
    ':email' => $email,
    ':origin' => $origin
  ]);

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao salvar lead.']);
}


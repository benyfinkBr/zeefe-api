<?php
require_once 'apiconfig.php';

header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Não autorizado.']);
  exit;
}

function admin_can_surveys_read(PDO $pdo, int $adminId): bool {
  try {
    $stmt = $pdo->prepare('SELECT a.is_master, p.permissions_json FROM admins a LEFT JOIN admin_profiles p ON p.id = a.profile_id WHERE a.id = :id LIMIT 1');
    $stmt->execute([':id' => $adminId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return false;
    if (!empty($row['is_master'])) return true;
    $raw = $row['permissions_json'] ?? null;
    if (!$raw) return false;
    if (is_string($raw)) $raw = json_decode($raw, true);
    if (!is_array($raw)) return false;
    $perms = $raw['surveys'] ?? [];
    return !empty($perms['read']);
  } catch (Throwable $e) {
    return false;
  }
}

if (!admin_can_surveys_read($pdo, (int) $_SESSION['admin_id'])) {
  http_response_code(403);
  echo json_encode(['success' => false, 'error' => 'Sem permissão.']);
  exit;
}

$surveyId = (int) ($_GET['survey_id'] ?? 0);
if ($surveyId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Survey inválido.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT id, title FROM surveys WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $surveyId]);
  $survey = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$survey) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Survey não encontrado.']);
    exit;
  }

  $leadStmt = $pdo->prepare('SELECT id, email, origin, created_at, updated_at FROM survey_leads WHERE survey_id = :sid ORDER BY created_at DESC, id DESC');
  $leadStmt->execute([':sid' => $surveyId]);
  $leads = $leadStmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    'success' => true,
    'survey' => $survey,
    'leads' => $leads
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao carregar leads.']);
}


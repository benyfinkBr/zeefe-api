<?php
require_once 'apiconfig.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if (empty($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Nao autorizado.']);
  exit;
}

function admin_can_surveys(PDO $pdo, int $adminId, string $action): bool {
  try {
    $stmt = $pdo->prepare('SELECT a.is_master, p.permissions_json FROM admins a LEFT JOIN admin_profiles p ON p.id = a.profile_id WHERE a.id = :id LIMIT 1');
    $stmt->execute([':id' => $adminId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return false;
    if (!empty($row['is_master'])) return true;
    $raw = $row['permissions_json'] ?? null;
    if (!$raw) return false;
    if (is_string($raw)) {
      $raw = json_decode($raw, true);
    }
    if (!is_array($raw)) return false;
    $perms = $raw['surveys'] ?? [];
    return !empty($perms[$action]);
  } catch (Throwable $e) {
    return false;
  }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Metodo nao permitido.']);
  exit;
}

if (!admin_can_surveys($pdo, (int) $_SESSION['admin_id'], 'update')) {
  http_response_code(403);
  echo json_encode(['success' => false, 'error' => 'Sem permissao.']);
  exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
$surveyId = (int) ($payload['survey_id'] ?? 0);
if ($surveyId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Survey invalido.']);
  exit;
}

try {
  $surveyStmt = $pdo->prepare('SELECT id FROM surveys WHERE id = :id LIMIT 1');
  $surveyStmt->execute([':id' => $surveyId]);
  if (!$surveyStmt->fetchColumn()) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Survey nao encontrado.']);
    exit;
  }

  $pdo->beginTransaction();

  $respIdsStmt = $pdo->prepare('SELECT id FROM survey_responses WHERE survey_id = :sid');
  $respIdsStmt->execute([':sid' => $surveyId]);
  $responseIds = $respIdsStmt->fetchAll(PDO::FETCH_COLUMN, 0);
  $deletedAnswers = 0;
  if (!empty($responseIds)) {
    $responseIds = array_map('intval', $responseIds);
    $in = implode(',', array_fill(0, count($responseIds), '?'));
    $ansStmt = $pdo->prepare("DELETE FROM survey_answers WHERE response_id IN ($in)");
    $ansStmt->execute($responseIds);
    $deletedAnswers = (int) $ansStmt->rowCount();
  }

  $respStmt = $pdo->prepare('DELETE FROM survey_responses WHERE survey_id = :sid');
  $respStmt->execute([':sid' => $surveyId]);
  $deletedResponses = (int) $respStmt->rowCount();

  $pdo->commit();

  echo json_encode([
    'success' => true,
    'survey_id' => $surveyId,
    'deleted_responses' => $deletedResponses,
    'deleted_answers' => $deletedAnswers
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao apagar respostas.']);
}


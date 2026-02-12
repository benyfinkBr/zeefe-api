<?php
require_once 'apiconfig.php';

header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Não autorizado.']);
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

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') {
  if (!admin_can_surveys($pdo, (int) $_SESSION['admin_id'], 'read')) {
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
  $stmt = $pdo->prepare('SELECT id, title FROM surveys WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $surveyId]);
  $survey = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$survey) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Survey não encontrado.']);
    exit;
  }
  $qStmt = $pdo->prepare('SELECT * FROM survey_questions WHERE survey_id = :sid AND is_active = 1 ORDER BY order_index ASC, id ASC');
  $qStmt->execute([':sid' => $surveyId]);
  $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);
  $questionIds = array_map(fn($q) => (int) $q['id'], $questions);
  $optionsByQuestion = [];
  if ($questionIds) {
    $in = implode(',', array_fill(0, count($questionIds), '?'));
    $oStmt = $pdo->prepare("SELECT * FROM survey_options WHERE question_id IN ($in) ORDER BY order_index ASC, id ASC");
    $oStmt->execute($questionIds);
    $options = $oStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($options as $opt) {
      $qid = (int) $opt['question_id'];
      if (!isset($optionsByQuestion[$qid])) $optionsByQuestion[$qid] = [];
      $optionsByQuestion[$qid][] = $opt;
    }
  }
  foreach ($questions as &$q) {
    $qid = (int) $q['id'];
    $q['options'] = $optionsByQuestion[$qid] ?? [];
  }
  unset($q);
  echo json_encode(['success' => true, 'survey' => $survey, 'questions' => $questions]);
  exit;
}

if ($method !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
  exit;
}

if (!admin_can_surveys($pdo, (int) $_SESSION['admin_id'], 'update')) {
  http_response_code(403);
  echo json_encode(['success' => false, 'error' => 'Sem permissão.']);
  exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload || empty($payload['survey_id']) || !isset($payload['questions'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Payload inválido.']);
  exit;
}

$surveyId = (int) $payload['survey_id'];
$questions = is_array($payload['questions']) ? $payload['questions'] : [];
$validTypes = ['short_text', 'number', 'single_choice', 'multiple_choice', 'scale'];

try {
  $pdo->beginTransaction();

  $disableStmt = $pdo->prepare('UPDATE survey_questions SET is_active = 0 WHERE survey_id = :sid');
  $disableStmt->execute([':sid' => $surveyId]);

  $updateStmt = $pdo->prepare('UPDATE survey_questions SET question_text = :text, type = :type, required = :required, order_index = :ord, scale_min = :smin, scale_max = :smax, number_min = :nmin, number_max = :nmax, is_active = 1 WHERE id = :id AND survey_id = :sid');
  $insertStmt = $pdo->prepare('INSERT INTO survey_questions (survey_id, question_text, type, required, order_index, scale_min, scale_max, number_min, number_max, is_active) VALUES (:sid, :text, :type, :required, :ord, :smin, :smax, :nmin, :nmax, 1)');
  $deleteOptionsStmt = $pdo->prepare('DELETE FROM survey_options WHERE question_id = :qid');
  $insertOptionStmt = $pdo->prepare('INSERT INTO survey_options (question_id, label, value, order_index) VALUES (:qid, :label, :value, :ord)');

  foreach ($questions as $idx => $q) {
    $text = trim((string) ($q['question_text'] ?? ''));
    if ($text === '') continue;
    $type = (string) ($q['type'] ?? 'short_text');
    if (!in_array($type, $validTypes, true)) $type = 'short_text';
    $required = !empty($q['required']) ? 1 : 0;
    $orderIndex = (int) ($q['order_index'] ?? ($idx + 1));
    $scaleMin = isset($q['scale_min']) ? (int) $q['scale_min'] : 1;
    $scaleMax = isset($q['scale_max']) ? (int) $q['scale_max'] : 5;
    $numberMin = ($q['number_min'] ?? null);
    $numberMax = ($q['number_max'] ?? null);
    $qid = !empty($q['id']) ? (int) $q['id'] : 0;

    if ($qid > 0) {
      $updateStmt->execute([
        ':text' => $text,
        ':type' => $type,
        ':required' => $required,
        ':ord' => $orderIndex,
        ':smin' => $scaleMin,
        ':smax' => $scaleMax,
        ':nmin' => ($numberMin !== null && $numberMin !== '') ? $numberMin : null,
        ':nmax' => ($numberMax !== null && $numberMax !== '') ? $numberMax : null,
        ':id' => $qid,
        ':sid' => $surveyId
      ]);
    } else {
      $insertStmt->execute([
        ':sid' => $surveyId,
        ':text' => $text,
        ':type' => $type,
        ':required' => $required,
        ':ord' => $orderIndex,
        ':smin' => $scaleMin,
        ':smax' => $scaleMax,
        ':nmin' => ($numberMin !== null && $numberMin !== '') ? $numberMin : null,
        ':nmax' => ($numberMax !== null && $numberMax !== '') ? $numberMax : null
      ]);
      $qid = (int) $pdo->lastInsertId();
    }

    $deleteOptionsStmt->execute([':qid' => $qid]);
    $options = is_array($q['options'] ?? null) ? $q['options'] : [];
    foreach ($options as $optIdx => $opt) {
      $label = trim((string) ($opt['label'] ?? ''));
      if ($label === '') continue;
      $value = trim((string) ($opt['value'] ?? $label));
      $insertOptionStmt->execute([
        ':qid' => $qid,
        ':label' => $label,
        ':value' => $value,
        ':ord' => (int) ($opt['order_index'] ?? ($optIdx + 1))
      ]);
    }
  }

  $pdo->commit();
  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao salvar perguntas.']);
}

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
  $ruleStmt = $pdo->prepare('SELECT * FROM survey_branch_rules WHERE survey_id = :sid ORDER BY id ASC');
  $ruleStmt->execute([':sid' => $surveyId]);
  $rules = $ruleStmt->fetchAll(PDO::FETCH_ASSOC);
  $rulesByOption = [];
  $rulesByQuestion = [];
  foreach ($rules as $rule) {
    $ruleData = [
      'target_question_id' => isset($rule['target_question_id']) ? (int) $rule['target_question_id'] : null,
      'end_survey' => !empty($rule['end_survey']) ? 1 : 0
    ];
    $rulesByOption[(int) $rule['option_id']] = $ruleData;
    $rqid = (int) ($rule['question_id'] ?? 0);
    if ($rqid > 0) {
      if (!isset($rulesByQuestion[$rqid])) $rulesByQuestion[$rqid] = [];
      $rulesByQuestion[$rqid][] = [
        'option_order' => isset($rule['option_order']) ? (int) $rule['option_order'] : null,
        'option_label' => (string) ($rule['option_label'] ?? ''),
        'target_question_id' => $ruleData['target_question_id'],
        'end_survey' => $ruleData['end_survey']
      ];
    }
  }

  foreach ($questions as &$q) {
    $qid = (int) $q['id'];
    $opts = $optionsByQuestion[$qid] ?? [];
    foreach ($opts as &$opt) {
      $optId = (int) $opt['id'];
      $ruleData = $rulesByOption[$optId] ?? null;
      if (!$ruleData && !empty($rulesByQuestion[$qid])) {
        $candidateOrder = isset($opt['order_index']) ? (int) $opt['order_index'] : null;
        $candidateLabel = (string) ($opt['label'] ?? '');
        foreach ($rulesByQuestion[$qid] as $r) {
          if (($candidateOrder && $r['option_order'] && $candidateOrder === (int) $r['option_order']) || ($candidateLabel !== '' && $candidateLabel === (string) $r['option_label'])) {
            $ruleData = $r;
            break;
          }
        }
      }
      $opt['target_question_id'] = $ruleData['target_question_id'] ?? null;
      $opt['end_survey'] = $ruleData['end_survey'] ?? 0;
    }
    unset($opt);
    $q['options'] = $opts;
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
$rules = is_array($payload['rules'] ?? null) ? $payload['rules'] : [];
$validTypes = ['short_text', 'number', 'single_choice', 'multiple_choice', 'scale'];

try {
  $pdo->beginTransaction();

  $disableStmt = $pdo->prepare('UPDATE survey_questions SET is_active = 0 WHERE survey_id = :sid');
  $disableStmt->execute([':sid' => $surveyId]);

  $updateStmt = $pdo->prepare('UPDATE survey_questions SET question_text = :text, type = :type, required = :required, order_index = :ord, scale_min = :smin, scale_max = :smax, number_min = :nmin, number_max = :nmax, flow_x = :flow_x, flow_y = :flow_y, is_active = 1 WHERE id = :id AND survey_id = :sid');
  $insertStmt = $pdo->prepare('INSERT INTO survey_questions (survey_id, question_text, type, required, order_index, scale_min, scale_max, number_min, number_max, flow_x, flow_y, default_next_question_id, end_if_no_branch, is_active) VALUES (:sid, :text, :type, :required, :ord, :smin, :smax, :nmin, :nmax, :flow_x, :flow_y, NULL, 0, 1)');
  $updateDefaultStmt = $pdo->prepare('UPDATE survey_questions SET default_next_question_id = :next_id, end_if_no_branch = :end_flag WHERE id = :id AND survey_id = :sid');
  $deleteOptionsStmt = $pdo->prepare('DELETE FROM survey_options WHERE question_id = :qid');
  $insertOptionStmt = $pdo->prepare('INSERT INTO survey_options (question_id, label, value, order_index) VALUES (:qid, :label, :value, :ord)');
  $deleteRulesStmt = $pdo->prepare('DELETE FROM survey_branch_rules WHERE survey_id = :sid');
  $insertRuleStmt = $pdo->prepare('INSERT INTO survey_branch_rules (survey_id, question_id, option_id, option_order, option_label, target_question_id, end_survey) VALUES (:sid, :qid, :oid, :oord, :olbl, :tid, :end_survey)');
  $questionIdMap = [];
  $optionIdMap = [];
  $pendingDefault = [];

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
    $flowX = isset($q['flow_x']) && $q['flow_x'] !== '' ? (int) $q['flow_x'] : null;
    $flowY = isset($q['flow_y']) && $q['flow_y'] !== '' ? (int) $q['flow_y'] : null;
    $qid = !empty($q['id']) ? (int) $q['id'] : 0;
    $tempKey = isset($q['temp_key']) ? (string) $q['temp_key'] : null;

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
        ':flow_x' => $flowX,
        ':flow_y' => $flowY,
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
        ':nmax' => ($numberMax !== null && $numberMax !== '') ? $numberMax : null,
        ':flow_x' => $flowX,
        ':flow_y' => $flowY
      ]);
      $qid = (int) $pdo->lastInsertId();
    }
    if ($tempKey) {
      $questionIdMap[$tempKey] = $qid;
    }
    $defaultMode = (string) ($q['default_next_mode'] ?? 'sequential');
    $pendingDefault[] = [
      'qid' => $qid,
      'mode' => $defaultMode,
      'target_question_id' => isset($q['default_next_question_id']) ? (int) $q['default_next_question_id'] : 0,
      'target_temp_key' => isset($q['default_next_temp_key']) ? (string) $q['default_next_temp_key'] : ''
    ];

    $deleteOptionsStmt->execute([':qid' => $qid]);
    $options = is_array($q['options'] ?? null) ? $q['options'] : [];
    foreach ($options as $optIdx => $opt) {
      $label = trim((string) ($opt['label'] ?? ''));
      if ($label === '') continue;
      $value = trim((string) ($opt['value'] ?? $label));
      $orderIndex = (int) ($opt['order_index'] ?? ($optIdx + 1));
      $insertOptionStmt->execute([
        ':qid' => $qid,
        ':label' => $label,
        ':value' => $value,
        ':ord' => $orderIndex
      ]);
      $optId = (int) $pdo->lastInsertId();
      if (!isset($optionIdMap[$qid])) $optionIdMap[$qid] = [];
      $optionIdMap[$qid][$orderIndex] = $optId;
    }
  }

  foreach ($pendingDefault as $pd) {
    $qid = (int) $pd['qid'];
    if ($qid <= 0) continue;
    $nextId = null;
    $endFlag = 0;
    if ($pd['mode'] === 'end') {
      $endFlag = 1;
      $nextId = null;
    } elseif ($pd['mode'] === 'question') {
      $candidate = (int) ($pd['target_question_id'] ?? 0);
      if ($candidate <= 0 && !empty($pd['target_temp_key'])) {
        $candidate = (int) ($questionIdMap[$pd['target_temp_key']] ?? 0);
      }
      $nextId = $candidate > 0 ? $candidate : null;
    } else {
      $nextId = null;
      $endFlag = 0;
    }
    $updateDefaultStmt->execute([
      ':next_id' => $nextId,
      ':end_flag' => $endFlag,
      ':id' => $qid,
      ':sid' => $surveyId
    ]);
  }

  $deleteRulesStmt->execute([':sid' => $surveyId]);
  foreach ($rules as $rule) {
    $qid = (int) ($rule['question_id'] ?? 0);
    if ($qid <= 0 && !empty($rule['question_temp_key'])) {
      $qid = (int) ($questionIdMap[$rule['question_temp_key']] ?? 0);
    }
    $tid = (int) ($rule['target_question_id'] ?? 0);
    if ($tid <= 0 && !empty($rule['target_temp_key'])) {
      $tid = (int) ($questionIdMap[$rule['target_temp_key']] ?? 0);
    }
    $oid = (int) ($rule['option_id'] ?? 0);
    $endSurvey = !empty($rule['end_survey']) ? 1 : 0;
    if ($qid > 0) {
      $orderIndex = (int) ($rule['option_order'] ?? 0);
      if ($orderIndex > 0 && isset($optionIdMap[$qid][$orderIndex])) {
        $oid = (int) $optionIdMap[$qid][$orderIndex];
      }
    }
    if ($qid <= 0 || $oid <= 0) continue;
    if ($endSurvey !== 1 && $tid <= 0) continue;
    if ($endSurvey === 1) $tid = null;
    $insertRuleStmt->execute([
      ':sid' => $surveyId,
      ':qid' => $qid,
      ':oid' => $oid,
      ':oord' => (int) ($rule['option_order'] ?? 0) ?: null,
      ':olbl' => (string) ($rule['option_label'] ?? ''),
      ':tid' => $tid,
      ':end_survey' => $endSurvey
    ]);
  }

  $pdo->commit();
  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao salvar perguntas.']);
}

<?php
require_once 'apiconfig.php';

header('Content-Type: application/json');

$token = preg_replace('/[^a-f0-9]/i', '', $_GET['token'] ?? '');
if ($token === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Token inválido.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT id, title, description, thank_you_message FROM surveys WHERE token = :token AND status = "ativo" LIMIT 1');
  $stmt->execute([':token' => $token]);
  $survey = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$survey) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Questionário não encontrado.']);
    exit;
  }

  $qStmt = $pdo->prepare('SELECT * FROM survey_questions WHERE survey_id = :sid AND is_active = 1 ORDER BY order_index ASC, id ASC');
  $qStmt->execute([':sid' => $survey['id']]);
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
  $ruleStmt->execute([':sid' => $survey['id']]);
  $rules = $ruleStmt->fetchAll(PDO::FETCH_ASSOC);

  foreach ($questions as &$q) {
    $qid = (int) $q['id'];
    $opts = $optionsByQuestion[$qid] ?? [];
    foreach ($opts as &$opt) {
      $opt['branch_to'] = null;
      $opt['branch_end'] = 0;
      foreach ($rules as $rule) {
        if ((int) $rule['option_id'] === (int) $opt['id']) {
          $opt['branch_to'] = isset($rule['target_question_id']) ? (int) $rule['target_question_id'] : null;
          $opt['branch_end'] = !empty($rule['end_survey']) ? 1 : 0;
          break;
        }
      }
    }
    unset($opt);
    $q['options'] = $opts;
  }
  unset($q);

  echo json_encode(['success' => true, 'survey' => $survey, 'questions' => $questions]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao carregar questionário.']);
}

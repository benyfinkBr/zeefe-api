<?php
require_once 'apiconfig.php';

header('Content-Type: application/json');

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload || empty($payload['token']) || !isset($payload['answers'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Payload inválido.']);
  exit;
}

$token = preg_replace('/[^a-f0-9]/i', '', (string) $payload['token']);
if ($token === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Token inválido.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT id, status FROM surveys WHERE token = :token LIMIT 1');
  $stmt->execute([':token' => $token]);
  $survey = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$survey || $survey['status'] !== 'ativo') {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Questionário indisponível.']);
    exit;
  }

  $qStmt = $pdo->prepare('SELECT * FROM survey_questions WHERE survey_id = :sid AND is_active = 1 ORDER BY order_index ASC, id ASC');
  $qStmt->execute([':sid' => $survey['id']]);
  $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);
  $questionMap = [];
  $orderedQuestions = [];
  foreach ($questions as $q) {
    $qid = (int) $q['id'];
    $questionMap[$qid] = $q;
    $orderedQuestions[] = $qid;
  }
  $questionIds = array_keys($questionMap);
  $optionsByQuestion = [];
  if ($questionIds) {
    $in = implode(',', array_fill(0, count($questionIds), '?'));
    $oStmt = $pdo->prepare("SELECT id, question_id FROM survey_options WHERE question_id IN ($in) ORDER BY question_id ASC, order_index ASC, id ASC");
    $oStmt->execute($questionIds);
    $options = $oStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($options as $opt) {
      $qid = (int) $opt['question_id'];
      if (!isset($optionsByQuestion[$qid])) $optionsByQuestion[$qid] = [];
      $optionsByQuestion[$qid][] = (int) $opt['id'];
    }
  }

  $ruleMapByQuestion = [];
  if ($questionIds) {
    $in = implode(',', array_fill(0, count($questionIds), '?'));
    $rStmt = $pdo->prepare("SELECT question_id, option_id, target_question_id, end_survey FROM survey_branch_rules WHERE survey_id = ? AND question_id IN ($in) ORDER BY id ASC");
    $params = array_merge([(int) $survey['id']], $questionIds);
    $rStmt->execute($params);
    $rows = $rStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $r) {
      $qid = (int) $r['question_id'];
      if (!isset($ruleMapByQuestion[$qid])) $ruleMapByQuestion[$qid] = [];
      $ruleMapByQuestion[$qid][] = [
        'option_id' => (int) $r['option_id'],
        'target_question_id' => isset($r['target_question_id']) ? (int) $r['target_question_id'] : null,
        'end_survey' => !empty($r['end_survey']) ? 1 : 0
      ];
    }
  }

  $answers = is_array($payload['answers']) ? $payload['answers'] : [];
  $answersByQuestion = [];
  foreach ($answers as $ans) {
    $qid = isset($ans['question_id']) ? (int) $ans['question_id'] : 0;
    if ($qid > 0) $answersByQuestion[$qid] = $ans;
  }

  $orderedIndexById = [];
  foreach ($orderedQuestions as $i => $qid) $orderedIndexById[$qid] = $i;
  $reachable = [];
  if ($orderedQuestions) {
    $visited = [];
    $currentQid = $orderedQuestions[0];
    while ($currentQid && isset($questionMap[$currentQid]) && empty($visited[$currentQid])) {
      $visited[$currentQid] = 1;
      $reachable[] = $currentQid;
      $q = $questionMap[$currentQid];
      $ans = $answersByQuestion[$currentQid] ?? null;
      $nextQid = null;
      $end = false;

      $rules = $ruleMapByQuestion[$currentQid] ?? [];
      if ($ans && $rules) {
        if ($q['type'] === 'single_choice') {
          $selected = (int) ($ans['option_id'] ?? 0);
          foreach ($rules as $rule) {
            if ((int) $rule['option_id'] === $selected) {
              if (!empty($rule['end_survey'])) $end = true;
              else $nextQid = (int) ($rule['target_question_id'] ?? 0);
              break;
            }
          }
        } elseif ($q['type'] === 'multiple_choice') {
          $selectedList = array_map('intval', (array) ($ans['option_ids'] ?? []));
          $optionOrder = $optionsByQuestion[$currentQid] ?? [];
          foreach ($optionOrder as $optId) {
            if (!in_array((int) $optId, $selectedList, true)) continue;
            foreach ($rules as $rule) {
              if ((int) $rule['option_id'] === (int) $optId) {
                if (!empty($rule['end_survey'])) $end = true;
                else $nextQid = (int) ($rule['target_question_id'] ?? 0);
                break 2;
              }
            }
          }
        }
      }

      if ($end) break;
      if (!$nextQid) {
        if (!empty($q['end_if_no_branch'])) {
          break;
        }
        $defaultNext = (int) ($q['default_next_question_id'] ?? 0);
        if ($defaultNext > 0 && isset($questionMap[$defaultNext])) {
          $nextQid = $defaultNext;
        } else {
          $idx = $orderedIndexById[$currentQid] ?? null;
          if ($idx !== null) {
            $nextQid = $orderedQuestions[$idx + 1] ?? null;
          }
        }
      }
      if (!$nextQid || !isset($questionMap[$nextQid])) break;
      $currentQid = $nextQid;
    }
  }

  foreach ($questions as $q) {
    $qid = (int) $q['id'];
    if (!in_array($qid, $reachable, true)) continue;
    $required = !empty($q['required']);
    if (!$required) continue;
    $ans = $answersByQuestion[$qid] ?? null;
    $type = $q['type'];
    $valid = false;
    if ($ans) {
      if ($type === 'short_text') {
        $valid = trim((string) ($ans['value'] ?? '')) !== '';
      } elseif ($type === 'number' || $type === 'scale') {
        $value = $ans['value'] ?? null;
        $valid = $value !== null && $value !== '' && is_numeric($value);
      } elseif ($type === 'single_choice') {
        $optionId = (int) ($ans['option_id'] ?? 0);
        $valid = $optionId > 0 && in_array($optionId, $optionsByQuestion[$qid] ?? [], true);
      } elseif ($type === 'multiple_choice') {
        $vals = $ans['option_ids'] ?? [];
        if (is_array($vals)) {
          $allowed = $optionsByQuestion[$qid] ?? [];
          $vals = array_values(array_filter(array_map('intval', $vals), fn($v) => in_array($v, $allowed, true)));
          $valid = count($vals) > 0;
          $answersByQuestion[$qid]['option_ids'] = $vals;
        }
      }
    }
    if (!$valid) {
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => 'Responda todas as perguntas obrigatórias.']);
      exit;
    }
  }

  $pdo->beginTransaction();
  $insResp = $pdo->prepare('INSERT INTO survey_responses (survey_id, ip_address, user_agent) VALUES (:sid, :ip, :ua)');
  $insResp->execute([
    ':sid' => $survey['id'],
    ':ip' => $_SERVER['REMOTE_ADDR'] ?? null,
    ':ua' => $_SERVER['HTTP_USER_AGENT'] ?? null
  ]);
  $responseId = (int) $pdo->lastInsertId();

  $insAns = $pdo->prepare('INSERT INTO survey_answers (response_id, question_id, answer_text, answer_number, answer_option_id, answer_options_json) VALUES (:rid, :qid, :text, :num, :opt, :opts)');
  foreach ($answersByQuestion as $qid => $ans) {
    if (!isset($questionMap[$qid])) continue;
    $q = $questionMap[$qid];
    $type = $q['type'];
    $text = null;
    $num = null;
    $opt = null;
    $opts = null;

    if ($type === 'short_text') {
      $text = trim((string) ($ans['value'] ?? ''));
    } elseif ($type === 'number' || $type === 'scale') {
      $num = isset($ans['value']) && $ans['value'] !== '' ? (float) $ans['value'] : null;
    } elseif ($type === 'single_choice') {
      $opt = isset($ans['option_id']) ? (int) $ans['option_id'] : null;
      if ($opt && !in_array($opt, $optionsByQuestion[$qid] ?? [], true)) {
        $opt = null;
      }
    } elseif ($type === 'multiple_choice') {
      $vals = $ans['option_ids'] ?? [];
      if (is_array($vals) && $vals) {
        $allowed = $optionsByQuestion[$qid] ?? [];
        $filtered = array_values(array_filter(array_map('intval', $vals), fn($v) => in_array($v, $allowed, true)));
        if ($filtered) {
          $opts = json_encode($filtered);
        }
      }
    }

    $insAns->execute([
      ':rid' => $responseId,
      ':qid' => $qid,
      ':text' => $text,
      ':num' => $num,
      ':opt' => $opt,
      ':opts' => $opts
    ]);
  }

  $pdo->commit();
  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao salvar respostas.']);
}

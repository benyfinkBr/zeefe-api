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

try {
  $stmt = $pdo->prepare('SELECT id, title FROM surveys WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $surveyId]);
  $survey = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$survey) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Survey não encontrado.']);
    exit;
  }

  $qStmt = $pdo->prepare('SELECT * FROM survey_questions WHERE survey_id = :sid ORDER BY order_index ASC, id ASC');
  $qStmt->execute([':sid' => $surveyId]);
  $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);

  $rStmt = $pdo->prepare('SELECT * FROM survey_responses WHERE survey_id = :sid ORDER BY submitted_at DESC, id DESC');
  $rStmt->execute([':sid' => $surveyId]);
  $responses = $rStmt->fetchAll(PDO::FETCH_ASSOC);

  $responseIds = array_map(fn($r) => (int) $r['id'], $responses);
  $answersByResponse = [];
  if ($responseIds) {
    $in = implode(',', array_fill(0, count($responseIds), '?'));
    $aStmt = $pdo->prepare("SELECT * FROM survey_answers WHERE response_id IN ($in)");
    $aStmt->execute($responseIds);
    $answers = $aStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($answers as $ans) {
      $rid = (int) $ans['response_id'];
      if (!isset($answersByResponse[$rid])) $answersByResponse[$rid] = [];
      $answersByResponse[$rid][] = $ans;
    }
  }

  $optionsByQuestion = [];
  $questionIds = array_map(fn($q) => (int) $q['id'], $questions);
  if ($questionIds) {
    $in = implode(',', array_fill(0, count($questionIds), '?'));
    $oStmt = $pdo->prepare("SELECT * FROM survey_options WHERE question_id IN ($in)");
    $oStmt->execute($questionIds);
    $options = $oStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($options as $opt) {
      $qid = (int) $opt['question_id'];
      if (!isset($optionsByQuestion[$qid])) $optionsByQuestion[$qid] = [];
      $optionsByQuestion[$qid][$opt['id']] = $opt['label'];
    }
  }

  $formattedResponses = [];
  foreach ($responses as $resp) {
    $rid = (int) $resp['id'];
    $answerMap = [];
    $answers = $answersByResponse[$rid] ?? [];
    foreach ($answers as $ans) {
      $qid = (int) $ans['question_id'];
      $display = '';
      if (!empty($ans['answer_text'])) {
        $display = $ans['answer_text'];
      } elseif ($ans['answer_number'] !== null) {
        $display = rtrim(rtrim((string) $ans['answer_number'], '0'), '.');
      } elseif (!empty($ans['answer_option_id'])) {
        $display = $optionsByQuestion[$qid][$ans['answer_option_id']] ?? ('#' . $ans['answer_option_id']);
      } elseif (!empty($ans['answer_options_json'])) {
        $vals = json_decode($ans['answer_options_json'], true);
        if (is_array($vals)) {
          $labels = [];
          foreach ($vals as $optId) {
            $labels[] = $optionsByQuestion[$qid][$optId] ?? ('#' . $optId);
          }
          $display = implode(', ', $labels);
        }
      }
      $answerMap[$qid] = [
        'display' => $display
      ];
    }
    $formattedResponses[] = [
      'id' => $rid,
      'submitted_at' => $resp['submitted_at'],
      'answers' => $answerMap
    ];
  }

  echo json_encode([
    'success' => true,
    'survey' => $survey,
    'questions' => $questions,
    'responses' => $formattedResponses
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao carregar resultados.']);
}

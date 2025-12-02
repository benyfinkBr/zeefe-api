<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/payment_intents.php';

$context = preg_replace('/[^a-z]/', '', strtolower($_GET['context'] ?? ''));
$contextId = isset($_GET['context_id']) ? (int) $_GET['context_id'] : 0;

if (!in_array($context, ['reservation','workshop'], true) || $contextId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
  exit;
}

try {
  payment_intents_ensure_table($pdo);
  $stmt = $pdo->prepare('SELECT * FROM payment_intents WHERE context = :ctx AND context_id = :id ORDER BY id DESC LIMIT 1');
  $stmt->execute([':ctx' => $context, ':id' => $contextId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    echo json_encode(['success' => true, 'intent' => null]);
    exit;
  }
  if (!empty($row['metadata'])) {
    $row['metadata'] = json_decode($row['metadata'], true);
  }
  unset($row['last_payload']);
  echo json_encode(['success' => true, 'intent' => $row]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

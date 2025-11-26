<?php
require_once 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  $id = isset($data['id']) ? (int) $data['id'] : 0;

  if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
  }

  $stmt = $pdo->prepare("UPDATE posts SET views_count = views_count + 1 WHERE id = :id AND status = 'publicado'");
  $stmt->execute([':id' => $id]);

  echo json_encode(['success' => true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}


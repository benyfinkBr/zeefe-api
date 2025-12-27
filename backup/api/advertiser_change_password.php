<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $id = isset($data['id']) ? (int)$data['id'] : 0;
  $current = $data['current_password'] ?? '';
  $new = $data['new_password'] ?? '';

  if ($id <= 0 || $current === '' || $new === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT id, password_hash FROM advertisers WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Anunciante não encontrado.']);
    exit;
  }

  if (!password_verify($current, $row['password_hash'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Senha atual incorreta.']);
    exit;
  }

  $newHash = password_hash($new, PASSWORD_DEFAULT);
  $upd = $pdo->prepare('UPDATE advertisers SET password_hash = :h WHERE id = :id');
  $upd->execute([':h' => $newHash, ':id' => $id]);

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


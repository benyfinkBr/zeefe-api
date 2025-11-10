<?php
require 'apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true);
  $id = isset($data['id']) ? (int)$data['id'] : 0;
  $current = $data['current_password'] ?? '';
  $new = $data['new_password'] ?? '';

  if ($id <= 0 || $current === '' || $new === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
    exit;
  }

  // Força mínima: 8+ e mistura básica (letra, número e símbolo)
  $hasLetter = preg_match('/[A-Za-z]/', $new);
  $hasNumber = preg_match('/\d/', $new);
  $hasSymbol = preg_match('/[^A-Za-z0-9]/', $new);
  if (strlen($new) < 8 || !$hasLetter || !$hasNumber || !$hasSymbol) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A nova senha não atende os requisitos.']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT id, password_hash FROM clients WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $id]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Cliente não encontrado.']);
    exit;
  }

  $hash = $client['password_hash'] ?? '';
  $ok = false;
  if ($hash) {
    $info = password_get_info($hash);
    if (($info['algo'] ?? 0) !== 0) {
      $ok = password_verify($current, $hash);
    }
  }
  if (!$ok) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Senha atual incorreta.']);
    exit;
  }

  $newHash = password_hash($new, PASSWORD_DEFAULT);
  $upd = $pdo->prepare('UPDATE clients SET password_hash = :hash, updated_at = NOW() WHERE id = :id');
  $upd->execute([':hash' => $newHash, ':id' => $id]);

  echo json_encode(['success' => true, 'message' => 'Senha atualizada com sucesso.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


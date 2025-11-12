<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true);
  $id = isset($data['id']) ? (int)$data['id'] : 0;
  if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Convite inválido']);
    exit;
  }

  $stmt = $pdo->prepare("UPDATE company_invitations SET status='cancelado' WHERE id = :id AND status = 'pendente'");
  $stmt->execute([':id' => $id]);
  echo json_encode(['success' => true, 'message' => 'Convite cancelado.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


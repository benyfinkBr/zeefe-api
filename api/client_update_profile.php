<?php
require 'apiconfig.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;
$name = trim($data['name'] ?? '');
$login = trim($data['login'] ?? '');
$phone = preg_replace('/\D/', '', $data['phone'] ?? '');
$whatsapp = preg_replace('/\D/', '', $data['whatsapp'] ?? '');

if ($id <= 0 || $name === '' || $login === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT COUNT(*) FROM clients WHERE login = :login AND id <> :id');
  $stmt->execute([':login' => $login, ':id' => $id]);
  if ($stmt->fetchColumn() > 0) {
    echo json_encode(['success' => false, 'error' => 'Este login já está em uso.']);
    exit;
  }

  $stmtUpd = $pdo->prepare('UPDATE clients SET name = :name, login = :login, phone = :phone, whatsapp = :whatsapp, updated_at = NOW() WHERE id = :id');
  $stmtUpd->execute([
    ':name' => $name,
    ':login' => $login,
    ':phone' => $phone ?: null,
    ':whatsapp' => $whatsapp ?: null,
    ':id' => $id
  ]);

  $stmtGet = $pdo->prepare('SELECT id, name, email, login, cpf, phone, whatsapp, company_id FROM clients WHERE id = :id LIMIT 1');
  $stmtGet->execute([':id' => $id]);
  $client = $stmtGet->fetch(PDO::FETCH_ASSOC);

  if (!$client) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Cliente não encontrado.']);
    exit;
  }

  echo json_encode([
    'success' => true,
    'message' => 'Dados atualizados com sucesso.',
    'client' => [
      'id' => (int) $client['id'],
      'name' => $client['name'],
      'email' => $client['email'],
      'login' => $client['login'],
      'cpf' => $client['cpf'],
      'phone' => $client['phone'],
      'whatsapp' => $client['whatsapp'],
      'company_id' => $client['company_id']
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  if (!isset($_SESSION['client_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Sessao nao autenticada']);
    exit;
  }

  $data = json_decode(file_get_contents('php://input'), true);
  $token = trim((string)($data['token'] ?? ''));
  if ($token === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Token invalido']);
    exit;
  }

  $clientId = (int)$_SESSION['client_id'];
  $cstmt = $pdo->prepare('SELECT id, email, cpf FROM clients WHERE id = :id LIMIT 1');
  $cstmt->execute([':id' => $clientId]);
  $client = $cstmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Cliente nao encontrado']);
    exit;
  }
  $email = trim((string)($client['email'] ?? ''));
  $cpfDigits = preg_replace('/\D/', '', (string)($client['cpf'] ?? ''));

  $stmt = $pdo->prepare('SELECT * FROM company_invitations WHERE token = :token LIMIT 1');
  $stmt->execute([':token' => $token]);
  $inv = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$inv) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Convite nao encontrado']);
    exit;
  }
  if (strtolower((string)$inv['status']) !== 'pendente') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Convite indisponivel']);
    exit;
  }

  $invCpf = preg_replace('/\D/', '', (string)($inv['cpf'] ?? ''));
  $matches = false;
  if (!empty($inv['client_id']) && (int)$inv['client_id'] === $clientId) {
    $matches = true;
  }
  if (!$matches && $email !== '' && !empty($inv['invite_email']) && strtolower($inv['invite_email']) === strtolower($email)) {
    $matches = true;
  }
  if (!$matches && $cpfDigits !== '' && $invCpf !== '' && $cpfDigits === $invCpf) {
    $matches = true;
  }
  if (!$matches) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Convite nao pertence ao usuario']);
    exit;
  }

  $upd = $pdo->prepare("UPDATE company_invitations SET status = 'cancelado' WHERE id = :id");
  $upd->execute([':id' => $inv['id']]);

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

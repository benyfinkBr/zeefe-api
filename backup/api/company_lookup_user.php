<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método inválido']);
    exit;
  }
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $cpf = preg_replace('/\D/', '', (string)($data['cpf'] ?? ''));
  $email = trim((string)($data['email'] ?? ''));
  if ($cpf === '' && $email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Informe CPF ou e‑mail.']);
    exit;
  }

  $client = null;
  if ($cpf !== '') {
    $q = $pdo->prepare("SELECT id, name, email, login FROM clients WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = :cpf LIMIT 1");
    $q->execute([':cpf' => $cpf]);
    $client = $q->fetch(PDO::FETCH_ASSOC) ?: null;
  }
  if (!$client && $email !== '') {
    $q = $pdo->prepare('SELECT id, name, email, login FROM clients WHERE email = :email LIMIT 1');
    $q->execute([':email' => $email]);
    $client = $q->fetch(PDO::FETCH_ASSOC) ?: null;
  }

  echo json_encode([
    'success' => true,
    'found' => (bool)$client,
    'client' => $client
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: '.$e->getMessage()]);
}


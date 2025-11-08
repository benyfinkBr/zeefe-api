<?php
require 'apiconfig.php';

$token = trim($_GET['token'] ?? '');
if ($token === '') {
  echo json_encode(['success' => false, 'error' => 'Token inválido.']);
  exit;
}

try {
  $sql = 'SELECT id, email_verified_at, verification_token_expires FROM clients WHERE verification_token = :token LIMIT 1';
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':token' => $token]);
  $client = $stmt->fetch();

  if (!$client) {
    echo json_encode(['success' => false, 'error' => 'Token não encontrado.']);
    exit;
  }

  if (!empty($client['email_verified_at'])) {
    echo json_encode(['success' => true, 'message' => 'E-mail já verificado.']);
    exit;
  }

  if (!empty($client['verification_token_expires']) && (new DateTimeImmutable()) > new DateTimeImmutable($client['verification_token_expires'])) {
    echo json_encode(['success' => false, 'error' => 'Token expirado. Solicite um novo.']);
    exit;
  }

  $upd = $pdo->prepare('UPDATE clients SET email_verified_at = NOW(), verification_token = NULL, verification_token_expires = NULL, updated_at = NOW() WHERE id = :id');
  $upd->execute([':id' => $client['id']]);

  echo json_encode(['success' => true, 'message' => 'E-mail verificado com sucesso.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


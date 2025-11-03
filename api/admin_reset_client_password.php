<?php
require 'apiconfig.php';

$data = json_decode(file_get_contents('php://input'), true);
$clientId = isset($data['client_id']) ? (int) $data['client_id'] : 0;

if ($clientId <= 0) {
  echo json_encode(['success' => false, 'error' => 'ID inválido.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT email, name FROM clients WHERE id = ? LIMIT 1');
  $stmt->execute([$clientId]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    echo json_encode(['success' => false, 'error' => 'Cliente não encontrado.']);
    exit;
  }

  $newPassword = gerarSenhaTemporaria();
  $hash = password_hash($newPassword, PASSWORD_DEFAULT);

  $update = $pdo->prepare('UPDATE clients SET password = :password, password_hash = :hash, updated_at = NOW() WHERE id = :id');
  $update->execute([':password' => $newPassword, ':hash' => $hash, ':id' => $clientId]);

  if (!empty($client['email'])) {
    $subject = 'Ze.EFE - redefinição de senha';
    $message = "Olá {$client['name']},\nSua senha foi redefinida pelo time Ze.EFE. Nova senha: {$newPassword}\nRecomendamos alterá-la após o login.";
    @mail($client['email'], $subject, $message);
  }

  echo json_encode(['success' => true, 'newPassword' => $newPassword]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

function gerarSenhaTemporaria(int $len = 10): string {
  $bytes = random_bytes($len);
  return substr(str_replace(['/', '+', '='], '', base64_encode($bytes)), 0, $len);
}

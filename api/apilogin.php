<?php
require 'apiconfig.php';

// --- Permite apenas POST ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success'=>false,'error'=>'Método não permitido']);
  exit;
}

// --- Lê dados do corpo JSON ---
$data = getJsonInput();
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (!$username || !$password) {
  echo json_encode(['success'=>false,'error'=>'Usuário e senha são obrigatórios.']);
  exit;
}

try {
  // === tabela original ===
  $stmt = $pdo->prepare("SELECT id, username, password FROM admins WHERE username = :username OR email = :email LIMIT 1");
  $stmt->execute([
    ':username' => $username,
    ':email' => $username
  ]);
  $user = $stmt->fetch();

  // === compara diretamente (formato simples, igual ao original) ===
  if ($user && $user['password'] === $password) {
    echo json_encode(['success'=>true,'user'=>$user['username']]);
  } else {
    echo json_encode(['success'=>false,'error'=>'Usuário ou senha inválidos.']);
  }
} catch (Exception $e) {
  echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
?>

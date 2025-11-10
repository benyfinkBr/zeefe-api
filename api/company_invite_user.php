<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true);
  $companyId = isset($data['company_id']) ? (int)$data['company_id'] : 0;
  $cpf = preg_replace('/\D/', '', $data['cpf'] ?? '');
  $role = strtolower(trim($data['role'] ?? 'membro'));
  if (!in_array($role, ['admin','gestor','membro','leitor'], true)) $role = 'membro';

  if ($companyId <= 0 || strlen($cpf) !== 11) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
    exit;
  }

  // Garante a tabela de convites (idempotente, não falha se já existir)
  try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS company_invitations (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      company_id BIGINT NOT NULL,
      client_id BIGINT NOT NULL,
      cpf VARCHAR(14) NOT NULL,
      role ENUM('admin','gestor','membro','leitor') NOT NULL DEFAULT 'membro',
      token VARCHAR(128) NOT NULL,
      status ENUM('pendente','aceito','cancelado','expirado') NOT NULL DEFAULT 'pendente',
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL,
      accepted_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  } catch (Throwable $e) {
    // segue se não conseguir criar, mas é provável que falhe adiante se a tabela não existir
  }

  // Localiza cliente por CPF
  $stmt = $pdo->prepare('SELECT id, name, email, login, company_id FROM clients WHERE REPLACE(REPLACE(REPLACE(cpf, ".", ""), "-", ""), " ", "") = :cpf LIMIT 1');
  $stmt->execute([':cpf' => $cpf]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Cliente não encontrado para o CPF informado.']);
    exit;
  }

  $token = bin2hex(random_bytes(24));
  $expires = (new DateTime('+48 hours'))->format('Y-m-d H:i:s');
  $now = (new DateTime())->format('Y-m-d H:i:s');

  $ins = $pdo->prepare('INSERT INTO company_invitations (company_id, client_id, cpf, role, token, status, expires_at, created_at) VALUES (:company_id, :client_id, :cpf, :role, :token, \"pendente\", :expires, :created)');
  $ins->execute([
    ':company_id' => $companyId,
    ':client_id' => (int)$client['id'],
    ':cpf' => $cpf,
    ':role' => $role,
    ':token' => $token,
    ':expires' => $expires,
    ':created' => $now
  ]);

  // Busca nome fantasia para o e-mail
  $cstmt = $pdo->prepare('SELECT nome_fantasia, razao_social FROM companies WHERE id = :id LIMIT 1');
  $cstmt->execute([':id' => $companyId]);
  $company = $cstmt->fetch(PDO::FETCH_ASSOC) ?: [];
  $companyName = $company['nome_fantasia'] ?? $company['razao_social'] ?? 'sua empresa';

  $host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost');
  $acceptUrl = $host . '/api/company_accept_invite.php?token=' . urlencode($token);

  $html = mailer_render('company_user_invite', [
    'company_name' => $companyName,
    'accept_url' => $acceptUrl,
    'client_name' => $client['name'] ?? ''
  ]);
  $ok = mailer_send([$client['email']], 'Convite para acessar empresa no portal Ze.EFE', $html);

  echo json_encode([
    'success' => true,
    'message' => $ok ? 'Convite enviado por e-mail.' : 'Convite gerado. Não foi possível enviar o e-mail.',
    'invite' => [ 'token' => $token, 'expires_at' => $expires ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


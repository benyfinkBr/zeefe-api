<?php
require 'apiconfig.php';

$data = json_decode(file_get_contents('php://input'), true);
$login = trim($data['login'] ?? '');
$password = $data['password'] ?? '';

if ($login === '' || $password === '') {
  echo json_encode(['success' => false, 'error' => 'Informe login e senha.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT id, name, email, email_verified_at, login, cpf, password_hash, company_id, status, phone, whatsapp FROM clients WHERE login = :login OR email = :login OR cpf = :cpf LIMIT 1');
  $stmt->execute([':login' => $login, ':cpf' => preg_replace('/\D/', '', $login)]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$client) {
    echo json_encode(['success' => false, 'error' => 'Credenciais inválidas.']);
    exit;
  }

  if (in_array(strtolower($client['status']), ['inativo', 'bloqueado'], true)) {
    echo json_encode(['success' => false, 'error' => 'Conta inativa.']);
    exit;
  }

  $validated = false;
  $hash = $client['password_hash'] ?? '';
  if ($hash) {
    $info = password_get_info($hash);
    if (($info['algo'] ?? 0) !== 0) {
      $validated = password_verify($password, $hash);
    }
  }

  if (!$validated) {
    echo json_encode(['success' => false, 'error' => 'Credenciais inválidas.']);
    exit;
  }

  // Bloquear login se e-mail não verificado
  if (empty($client['email_verified_at'])) {
    echo json_encode(['success' => false, 'error' => 'Confirme seu e-mail para acessar o portal.']);
    exit;
  }

  // Enriquecer com informações de empresa e flag de master
  $companyId = $client['company_id'] ?? null;
  $companyName = null;
  $isCompanyMaster = false;
  if (!empty($companyId)) {
    try {
      // Tenta buscar master_client_id; se a coluna não existir, tratamos como não-master
      $q = $pdo->prepare('SELECT id, nome_fantasia, master_client_id FROM companies WHERE id = :id LIMIT 1');
      $q->execute([':id' => $companyId]);
      if ($row = $q->fetch(PDO::FETCH_ASSOC)) {
        $companyName = $row['nome_fantasia'] ?? null;
        if (array_key_exists('master_client_id', $row)) {
          $isCompanyMaster = (string)($row['master_client_id'] ?? '') === (string)$client['id'];
        }
      }
    } catch (Throwable $e) {
      // coluna ausente ou erro: mantém isCompanyMaster=false, sem quebrar o login
    }
  }

  echo json_encode([
    'success' => true,
    'client' => [
      'id' => $client['id'],
      'name' => $client['name'],
      'email' => $client['email'],
      'login' => $client['login'],
      'cpf' => $client['cpf'],
      'company_id' => $companyId,
      'company_name' => $companyName,
      'company_master' => $isCompanyMaster,
      'phone' => $client['phone'] ?? null,
      'whatsapp' => $client['whatsapp'] ?? null
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

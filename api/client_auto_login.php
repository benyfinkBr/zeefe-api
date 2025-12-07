<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/pagarme_customers.php';

$data = json_decode(file_get_contents('php://input'), true);
$token = trim($data['token'] ?? '');

if ($token === '') {
  echo json_encode(['success' => false, 'error' => 'Token ausente.']);
  exit;
}

try {
  // garante colunas novas (pagarme_customer_id)
  try { ensurePagarmeColumns($pdo); } catch (Throwable $e) {}

  $hash = hash('sha256', $token);
  $now = (new DateTimeImmutable())->format('Y-m-d H:i:s');

  try {
    $sql = 'SELECT t.client_id, t.expires_at, c.id, c.name, c.email, c.email_verified_at, c.login, c.cpf, c.password_hash, c.company_id, c.status, c.phone, c.whatsapp, c.pagarme_customer_id
            FROM client_remember_tokens t
            JOIN clients c ON c.id = t.client_id
            WHERE t.token_hash = :hash
            LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':hash' => $hash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
  } catch (Throwable $e) {
    $sql = 'SELECT t.client_id, t.expires_at, c.id, c.name, c.email, c.email_verified_at, c.login, c.cpf, c.password_hash, c.company_id, c.status, c.phone, c.whatsapp
            FROM client_remember_tokens t
            JOIN clients c ON c.id = t.client_id
            WHERE t.token_hash = :hash
            LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':hash' => $hash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
      $row['pagarme_customer_id'] = null;
    }
  }

  if (!$row) {
    echo json_encode(['success' => false, 'error' => 'Token inválido.']);
    exit;
  }

  if ($row['expires_at'] < $now) {
    // Token expirado
    echo json_encode(['success' => false, 'error' => 'Token expirado.']);
    exit;
  }

  if (in_array(strtolower($row['status'] ?? ''), ['inativo', 'bloqueado'], true)) {
    echo json_encode(['success' => false, 'error' => 'Conta inativa.']);
    exit;
  }

  if (empty($row['email_verified_at'])) {
    echo json_encode(['success' => false, 'error' => 'Confirme seu e-mail para acessar o portal.']);
    exit;
  }

  $companyId = $row['company_id'] ?? null;
  $companyName = null;
  $isCompanyMaster = false;
  if (!empty($companyId)) {
    try {
      $q = $pdo->prepare('SELECT id, nome_fantasia, master_client_id FROM companies WHERE id = :id LIMIT 1');
      $q->execute([':id' => $companyId]);
      if ($c = $q->fetch(PDO::FETCH_ASSOC)) {
        $companyName = $c['nome_fantasia'] ?? null;
        if (array_key_exists('master_client_id', $c)) {
          $isCompanyMaster = (string)($c['master_client_id'] ?? '') === (string)$row['id'];
        }
      }
    } catch (Throwable $e) {
      // ignore
    }
  }

  $pagarmeWarning = null;
  try {
    $pagarmeCustomer = ensurePagarmeCustomer($pdo, (int)$row['id']);
    $row['pagarme_customer_id'] = $pagarmeCustomer['id'] ?? ($row['pagarme_customer_id'] ?? null);
  } catch (Throwable $e) {
    $pagarmeWarning = 'Falha ao sincronizar com Pagar.me: ' . $e->getMessage();
  }

  $addrStmt = $pdo->prepare('SELECT street, number, complement, zip_code, city, state, country FROM client_addresses WHERE client_id = :cid ORDER BY updated_at DESC, id DESC LIMIT 1');
  $addrStmt->execute([':cid' => $row['id']]);
  $clientAddress = $addrStmt->fetch(PDO::FETCH_ASSOC) ?: null;

  $_SESSION['client_id'] = $row['id'];
  $_SESSION['client_name'] = $row['name'];

  echo json_encode([
    'success' => true,
    'client' => [
      'id' => $row['id'],
      'name' => $row['name'],
      'email' => $row['email'],
      'login' => $row['login'],
      'cpf' => $row['cpf'],
      'company_id' => $companyId,
      'company_name' => $companyName,
      'company_master' => $isCompanyMaster,
      'phone' => $row['phone'] ?? null,
      'whatsapp' => $row['whatsapp'] ?? null,
      'pagarme_customer_id' => $row['pagarme_customer_id'] ?? null,
      'address' => $clientAddress
    ],
    'pagarme_warning' => $pagarmeWarning
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

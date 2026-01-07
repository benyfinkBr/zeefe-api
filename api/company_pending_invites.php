<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  if (!isset($_SESSION['client_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Sessao nao autenticada']);
    exit;
  }

  // Garante colunas novas (idempotente)
  try {
    @$pdo->exec("ALTER TABLE company_invitations ADD COLUMN inviter_id BIGINT NULL");
    @$pdo->exec("ALTER TABLE company_invitations ADD COLUMN inviter_name VARCHAR(255) NULL");
  } catch (Throwable $e) { /* ignore */ }

  $clientId = (int)$_SESSION['client_id'];
  $stmt = $pdo->prepare('SELECT id, name, email, cpf FROM clients WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $clientId]);
  $client = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$client) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Cliente nao encontrado']);
    exit;
  }

  $email = trim((string)($client['email'] ?? ''));
  $cpfDigits = preg_replace('/\D/', '', (string)($client['cpf'] ?? ''));
  $now = (new DateTime())->format('Y-m-d H:i:s');

  $sql = "SELECT i.*, c.nome_fantasia, c.razao_social
          FROM company_invitations i
          JOIN companies c ON c.id = i.company_id
          WHERE i.status = 'pendente'
            AND i.expires_at >= :now
            AND (
              (i.client_id IS NOT NULL AND i.client_id = :client_id)
              OR (:email <> '' AND i.invite_email = :email)
              OR (:cpf <> '' AND REPLACE(REPLACE(REPLACE(i.cpf, '.', ''), '-', ''), ' ', '') = :cpf)
            )
          ORDER BY i.created_at DESC";

  try {
    $q = $pdo->prepare($sql);
    $q->execute([
      ':now' => $now,
      ':client_id' => $clientId,
      ':email' => $email,
      ':cpf' => $cpfDigits
    ]);
    $invites = $q->fetchAll(PDO::FETCH_ASSOC) ?: [];
  } catch (Throwable $e) {
    echo json_encode(['success' => true, 'invites' => []]);
    exit;
  }

  $payload = array_map(function ($inv) {
    return [
      'id' => $inv['id'] ?? null,
      'token' => $inv['token'] ?? '',
      'company_id' => $inv['company_id'] ?? null,
      'company_name' => $inv['nome_fantasia'] ?? $inv['razao_social'] ?? 'Empresa',
      'inviter_name' => $inv['inviter_name'] ?? '',
      'role' => $inv['role'] ?? 'membro',
      'status' => $inv['status'] ?? 'pendente',
      'created_at' => $inv['created_at'] ?? null,
      'expires_at' => $inv['expires_at'] ?? null
    ];
  }, $invites);

  echo json_encode(['success' => true, 'invites' => $payload]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

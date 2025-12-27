<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true);
  $id = isset($data['id']) ? (int)$data['id'] : 0;
  if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Convite inválido.']);
    exit;
  }

  $stmt = $pdo->prepare('SELECT * FROM company_invitations WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $id]);
  $inv = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$inv) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Convite não encontrado.']);
    exit;
  }

  if (!in_array(strtolower($inv['status']), ['pendente','expirado'], true)) {
    echo json_encode(['success' => false, 'error' => 'Somente convites pendentes ou expirados podem ser reenviados.']);
    exit;
  }

  // Recalcula expiração para +48h
  $expires = (new DateTime('+48 hours'))->format('Y-m-d H:i:s');
  $upd = $pdo->prepare("UPDATE company_invitations SET expires_at = :exp, status = 'pendente', created_at = NOW() WHERE id = :id");
  $upd->execute([':exp' => $expires, ':id' => $id]);

  // Carrega dados de e-mail/empresa
  $companyId = (int)($inv['company_id'] ?? 0);
  $cstmt = $pdo->prepare('SELECT nome_fantasia, razao_social FROM companies WHERE id = :id LIMIT 1');
  $cstmt->execute([':id' => $companyId]);
  $company = $cstmt->fetch(PDO::FETCH_ASSOC) ?: [];
  $companyName = $company['nome_fantasia'] ?? $company['razao_social'] ?? 'sua empresa';

  $recipient = null; $clientName = $inv['invite_name'] ?? '';
  if (!empty($inv['client_id'])) {
    $q = $pdo->prepare('SELECT name, email FROM clients WHERE id = :id LIMIT 1');
    $q->execute([':id' => (int)$inv['client_id']]);
    if ($cli = $q->fetch(PDO::FETCH_ASSOC)) {
      $recipient = $cli['email'];
      if (!$clientName) $clientName = $cli['name'] ?? '';
    }
  }
  if (!$recipient) $recipient = $inv['invite_email'] ?? '';
  if (!$recipient) {
    echo json_encode(['success' => false, 'error' => 'Convite sem e-mail associado.']);
    exit;
  }

  $host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost');
  $acceptUrl = $host . '/clientes.html?invite=' . urlencode($inv['token']);
  $html = mailer_render('company_user_invite.php', [
    'company_name' => $companyName,
    'accept_url' => $acceptUrl,
    'client_name' => $clientName,
  ]);
  $ok = mailer_send([$recipient], 'Convite para acessar empresa no portal Ze.EFE', $html);

  echo json_encode(['success' => true, 'message' => $ok ? 'Convite reenviado.' : 'Convite atualizado; e-mail não pôde ser enviado.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

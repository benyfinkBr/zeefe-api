<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true);
  $companyId = isset($data['company_id']) ? (int)$data['company_id'] : 0;
  $cpf = preg_replace('/\D/', '', $data['cpf'] ?? '');
  $email = trim($data['email'] ?? '');
  if ($companyId <= 0 || ($cpf === '' && $email === '')) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Informe empresa e CPF ou e‑mail.']);
    exit;
  }

  $sql = "SELECT * FROM company_invitations WHERE company_id = :cid AND status IN ('pendente','expirado') AND (cpf = :cpf OR invite_email = :email) ORDER BY created_at DESC LIMIT 1";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':cid'=>$companyId, ':cpf'=>$cpf, ':email'=>$email]);
  $inv = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$inv) {
    echo json_encode(['success' => false, 'error' => 'Nenhum convite pendente/expirado encontrado para os dados informados.']);
    exit;
  }

  $expires = (new DateTime('+48 hours'))->format('Y-m-d H:i:s');
  $upd = $pdo->prepare("UPDATE company_invitations SET expires_at = :exp, status = 'pendente', created_at = NOW() WHERE id = :id");
  $upd->execute([':exp'=>$expires, ':id'=>$inv['id']]);

  $recipient = $inv['invite_email'] ?? '';
  if (!$recipient && !empty($inv['client_id'])) {
    $q = $pdo->prepare('SELECT email FROM clients WHERE id = :id LIMIT 1');
    $q->execute([':id'=>(int)$inv['client_id']]);
    if ($row = $q->fetch(PDO::FETCH_ASSOC)) $recipient = $row['email'];
  }
  if (!$recipient) {
    echo json_encode(['success' => false, 'error' => 'Convite sem e‑mail associado.']);
    exit;
  }

  $cstmt = $pdo->prepare('SELECT nome_fantasia, razao_social FROM companies WHERE id = :id LIMIT 1');
  $cstmt->execute([':id'=>$companyId]);
  $company = $cstmt->fetch(PDO::FETCH_ASSOC) ?: [];
  $companyName = $company['nome_fantasia'] ?? $company['razao_social'] ?? 'sua empresa';
  $host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost');
  $acceptUrl = $host . '/clientes.html?invite=' . urlencode($inv['token']);
  $html = mailer_render('company_user_invite.php', [
    'company_name' => $companyName,
    'accept_url' => $acceptUrl,
    'client_name' => $inv['invite_name'] ?? ''
  ]);
  $ok = mailer_send([$recipient], 'Convite para acessar empresa no portal Ze.EFE', $html);

  echo json_encode(['success' => true, 'message' => $ok ? 'Convite reenviado.' : 'Convite atualizado; e‑mail não pôde ser enviado.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

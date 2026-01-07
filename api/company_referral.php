<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $company = trim($data['company'] ?? '');
  $contactName = trim($data['contact_name'] ?? '');
  $contactPhone = trim($data['contact_phone'] ?? '');
  $contactEmail = trim($data['contact_email'] ?? '');
  $reason = trim($data['reason'] ?? '');

  if ($company === '' || $contactName === '' || $contactPhone === '' || $contactEmail === '' || $reason === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Preencha todos os campos obrigatórios.']);
    exit;
  }

  if (!filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'E-mail inválido.']);
    exit;
  }

  $referrer = $data['referrer'] ?? [];
  $referrerId = isset($_SESSION['client_id']) ? (int)$_SESSION['client_id'] : (int)($referrer['id'] ?? 0);
  $refName = trim($referrer['name'] ?? '');
  $refEmail = trim($referrer['email'] ?? '');
  $refPhone = trim($referrer['phone'] ?? '');
  $refLogin = trim($referrer['login'] ?? '');

  if ($referrerId > 0 && $pdo) {
    $stmt = $pdo->prepare('SELECT id, name, email, phone, whatsapp, login FROM clients WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $referrerId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
      $refName = $row['name'] ?? $refName;
      $refEmail = $row['email'] ?? $refEmail;
      $refPhone = $row['phone'] ?? ($row['whatsapp'] ?? $refPhone);
      $refLogin = $row['login'] ?? $refLogin;
    }
  }

  $subject = 'Você tem uma nova indicação da empresa: ' . $company;
  $body = [];
  $body[] = '<h2>Nova indicacao de empresa</h2>';
  $body[] = '<p><strong>Empresa:</strong> ' . htmlspecialchars($company, ENT_QUOTES, 'UTF-8') . '</p>';
  $body[] = '<p><strong>Responsavel:</strong> ' . htmlspecialchars($contactName, ENT_QUOTES, 'UTF-8') . '</p>';
  $body[] = '<p><strong>Telefone:</strong> ' . htmlspecialchars($contactPhone, ENT_QUOTES, 'UTF-8') . '</p>';
  $body[] = '<p><strong>E-mail:</strong> ' . htmlspecialchars($contactEmail, ENT_QUOTES, 'UTF-8') . '</p>';
  $body[] = '<p><strong>Motivo:</strong><br>' . nl2br(htmlspecialchars($reason, ENT_QUOTES, 'UTF-8')) . '</p>';
  $body[] = '<hr>';
  $body[] = '<h3>Quem indicou</h3>';
  $body[] = '<p><strong>Nome:</strong> ' . htmlspecialchars($refName ?: 'Nao informado', ENT_QUOTES, 'UTF-8') . '</p>';
  $body[] = '<p><strong>E-mail:</strong> ' . htmlspecialchars($refEmail ?: 'Nao informado', ENT_QUOTES, 'UTF-8') . '</p>';
  $body[] = '<p><strong>Telefone:</strong> ' . htmlspecialchars($refPhone ?: 'Nao informado', ENT_QUOTES, 'UTF-8') . '</p>';
  if ($refLogin !== '') {
    $body[] = '<p><strong>Login:</strong> ' . htmlspecialchars($refLogin, ENT_QUOTES, 'UTF-8') . '</p>';
  }
  if ($referrerId > 0) {
    $body[] = '<p><strong>ID do cliente:</strong> ' . htmlspecialchars((string)$referrerId, ENT_QUOTES, 'UTF-8') . '</p>';
  }

  $htmlBody = implode('', $body);
  $sent = mailer_send('indique@zeefe.com.br', $subject, $htmlBody);
  if (!$sent) {
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/html; charset=UTF-8';
    $headers[] = 'From: ' . MAIL_FROM_NAME . ' <' . MAIL_FROM_ADDRESS . '>';
    $fallbackSent = @mail('indique@zeefe.com.br', $subject, $htmlBody, implode("\r\n", $headers));
    if (!$fallbackSent) {
      http_response_code(500);
      echo json_encode(['success' => false, 'error' => 'Falha ao enviar o e-mail.']);
      exit;
    }
  }

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

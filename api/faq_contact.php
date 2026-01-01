<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';

header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $name = trim($data['name'] ?? '');
  $email = trim($data['email'] ?? '');
  $issueType = trim($data['issue_type'] ?? '');
  $message = trim($data['message'] ?? '');

  if ($name === '' || $email === '' || $issueType === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Preencha todos os campos.']);
    exit;
  }

  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'E-mail inválido.']);
    exit;
  }

  $allowedTypes = ['reserva','pagamento','workshop','conta','empresa','checkin','outro'];
  if (!in_array($issueType, $allowedTypes, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo de dúvida inválido.']);
    exit;
  }

  $subject = '[Ze.EFE] Dúvida FAQ - ' . ucfirst($issueType);
  $bodyLines = [];
  $bodyLines[] = 'Nome: ' . $name;
  $bodyLines[] = 'Email: ' . $email;
  $bodyLines[] = 'Tipo: ' . $issueType;
  $bodyLines[] = '';
  $bodyLines[] = 'Mensagem:';
  $bodyLines[] = $message;

  send_mail('contato@zeefe.com.br', $subject, nl2br(htmlentities(implode("\n", $bodyLines), ENT_QUOTES, 'UTF-8')));

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

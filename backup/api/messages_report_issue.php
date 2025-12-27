<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $threadId = isset($data['thread_id']) ? (int)$data['thread_id'] : 0;
  $clientId = isset($data['client_id']) ? (int)$data['client_id'] : 0;
  $issueType = trim($data['issue_type'] ?? '');
  $description = trim($data['description'] ?? '');

  if ($threadId <= 0 || $clientId <= 0 || $issueType === '' || $description === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dados inválidos para relato.']);
    exit;
  }

  $allowedTypes = ['reserva','atendimento','cancelamento','pagamento','outro'];
  if (!in_array($issueType, $allowedTypes, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo de problema inválido.']);
    exit;
  }

  // Carrega contexto do thread
  $stmt = $pdo->prepare('SELECT t.*, r.date AS reserva_data, r.status AS reserva_status, r.room_id, rooms.name AS room_name
                         FROM message_threads t
                         LEFT JOIN reservations r ON r.id = t.reservation_id
                         LEFT JOIN rooms ON rooms.id = r.room_id
                         WHERE t.id = :id AND t.client_id = :cli
                         LIMIT 1');
  $stmt->execute([':id' => $threadId, ':cli' => $clientId]);
  $thread = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$thread) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Conversa não encontrada para este cliente.']);
    exit;
  }

  // Guarda em tabela própria (se existir)
  try {
    $ins = $pdo->prepare('INSERT INTO message_issues (thread_id, client_id, advertiser_id, issue_type, description, created_at)
                          VALUES (:t, :c, :a, :tp, :d, NOW())');
    $ins->execute([
      ':t'  => $threadId,
      ':c'  => $clientId,
      ':a'  => $thread['advertiser_id'] ?? null,
      ':tp' => $issueType,
      ':d'  => $description
    ]);
  } catch (Throwable $ignore) {
    // Se a tabela não existir, apenas segue com envio de e-mail / log.
  }

  // Monta um resumo para o admin
  $reservaId = $thread['reservation_id'] ?? null;
  $roomName  = $thread['room_name'] ?? '';
  $resData   = $thread['reserva_data'] ?? '';
  $resStatus = $thread['reserva_status'] ?? '';

  $subject = '[Ze.EFE] Relato de problema - ' . ucfirst($issueType);
  $bodyLines = [];
  $bodyLines[] = 'Cliente ID: ' . $clientId;
  $bodyLines[] = 'Thread ID: ' . $threadId;
  if ($reservaId) {
    $bodyLines[] = 'Reserva ID: ' . $reservaId;
    $bodyLines[] = 'Sala: ' . ($roomName ?: 'N/D');
    $bodyLines[] = 'Data: ' . ($resData ?: 'N/D');
    $bodyLines[] = 'Status da reserva: ' . ($resStatus ?: 'N/D');
  }
  $bodyLines[] = 'Tipo de problema: ' . $issueType;
  $bodyLines[] = '';
  $bodyLines[] = 'Descrição:';
  $bodyLines[] = $description;
  $bodyLines[] = '';
  $bodyLines[] = 'Consulte o painel de mensagens para ver o histórico completo da conversa.';

  try {
    send_mail('contato@zeefe.com.br', $subject, nl2br(htmlentities(implode("\n", $bodyLines), ENT_QUOTES, 'UTF-8')));
  } catch (Throwable $ignore) {
    // Se o e-mail falhar, não é crítico para o usuário.
  }

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}


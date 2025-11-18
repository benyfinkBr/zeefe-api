<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $threadId = isset($data['thread_id']) ? (int)$data['thread_id'] : 0;
  $sender   = strtolower(trim($data['sender_type'] ?? ''));
  $body     = trim($data['body'] ?? '');
  $actorClientId = isset($data['client_id']) ? (int)$data['client_id'] : 0;
  $actorAdvertiserId = isset($data['advertiser_id']) ? (int)$data['advertiser_id'] : 0;
  if ($threadId <= 0 || $sender === '' || $body === '') {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Dados inválidos']);
    exit;
  }
  if (!in_array($sender, ['client','advertiser'], true)) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'sender_type inválido']);
    exit;
  }

  // Optional participant check: if client_id/advertiser_id provided, ensure it matches the thread
  if ($actorClientId > 0 || $actorAdvertiserId > 0) {
    $q = $pdo->prepare('SELECT client_id, advertiser_id FROM message_threads WHERE id = :id');
    $q->execute([':id' => $threadId]);
    $thr = $q->fetch(PDO::FETCH_ASSOC);
    if (!$thr) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Thread não encontrada']); exit; }
    if ($actorClientId > 0 && (int)$thr['client_id'] !== $actorClientId) { http_response_code(403); echo json_encode(['success'=>false,'error'=>'Acesso negado']); exit; }
    if ($actorAdvertiserId > 0 && (int)$thr['advertiser_id'] !== $actorAdvertiserId) { http_response_code(403); echo json_encode(['success'=>false,'error'=>'Acesso negado']); exit; }
  }
  // Sanitização: oculta e-mails e telefones
  $sanitized = $body;
  // Strip HTML tags for safety (keep plain text)
  $sanitized = strip_tags($sanitized);
  // e-mails
  $sanitized = preg_replace('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', '[contato oculto]', $sanitized);
  // padrões comuns de telefone (Brasil e genérico), com separadores
  $sanitized = preg_replace('/(\+?\d{1,3}[\s\.\-]?)?(\(?\d{2}\)?[\s\.\-]?)?\d{4,5}[\s\.\-]?\d{4}/', '[contato oculto]', $sanitized);
  // sequências longas de dígitos com separadores (>= 8 dígitos)
  $sanitized = preg_replace('/(?:\+?\d[\s\.\-\(\)]*){8,}/', '[contato oculto]', $sanitized);
  // URLs de contato diretas
  $sanitized = preg_replace('/(mailto:|wa\.me|whatsapp\.com|tel:)/i', '[contato oculto]', $sanitized);

  // Length guard
  if (mb_strlen($sanitized, 'UTF-8') > 2000) {
    $sanitized = mb_substr($sanitized, 0, 2000, 'UTF-8');
  }

  $ins = $pdo->prepare('INSERT INTO messages (thread_id, sender_type, body, created_at) VALUES (:t,:s,:b,NOW())');
  $ins->execute([':t'=>$threadId, ':s'=>$sender, ':b'=>$sanitized]);
  $upd = $pdo->prepare('UPDATE message_threads SET last_message_at = NOW() WHERE id = :id');
  $upd->execute([':id'=>$threadId]);
  echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId(), 'body'=>$sanitized]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

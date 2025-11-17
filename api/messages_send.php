<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $threadId = isset($data['thread_id']) ? (int)$data['thread_id'] : 0;
  $sender   = trim($data['sender_type'] ?? ''); // client|advertiser|system
  $body     = trim($data['body'] ?? '');
  if ($threadId <= 0 || $sender === '' || $body === '') {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Dados inválidos']);
    exit;
  }
  // Sanitização: oculta e-mails e telefones
  $sanitized = $body;
  // e-mails
  $sanitized = preg_replace('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', '[contato oculto]', $sanitized);
  // padrões comuns de telefone (Brasil e genérico), com separadores
  $sanitized = preg_replace('/(\+?\d{1,3}[\s\.\-]?)?(\(?\d{2}\)?[\s\.\-]?)?\d{4,5}[\s\.\-]?\d{4}/', '[contato oculto]', $sanitized);
  // sequências longas de dígitos com separadores (>= 8 dígitos)
  $sanitized = preg_replace('/(?:\+?\d[\s\.\-\(\)]*){8,}/', '[contato oculto]', $sanitized);
  // URLs de contato diretas
  $sanitized = preg_replace('/(mailto:|wa\.me|whatsapp\.com|tel:)/i', '[contato oculto]', $sanitized);

  $ins = $pdo->prepare('INSERT INTO messages (thread_id, sender_type, body, created_at) VALUES (:t,:s,:b,NOW())');
  $ins->execute([':t'=>$threadId, ':s'=>$sender, ':b'=>$sanitized]);
  $upd = $pdo->prepare('UPDATE message_threads SET last_message_at = NOW() WHERE id = :id');
  $upd->execute([':id'=>$threadId]);
  echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId(), 'body'=>$sanitized]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

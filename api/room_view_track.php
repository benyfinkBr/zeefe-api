<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/policies.php';

header('Content-Type: application/json');

try {
  zeefe_policies_ensure_schema($pdo);
  $data = getJsonInput();
  $roomId = isset($data['room_id']) ? (int) $data['room_id'] : 0;
  if ($roomId <= 0) {
    throw new RuntimeException('Informe room_id.');
  }
  $sessionId = isset($data['session_id']) ? trim((string) $data['session_id']) : null;
  $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
  $ip = $_SERVER['REMOTE_ADDR'] ?? null;

  $stmt = $pdo->prepare('INSERT INTO room_views (room_id, session_id, user_agent, ip) VALUES (:room, :session, :ua, :ip)');
  $stmt->execute([
    ':room' => $roomId,
    ':session' => $sessionId ?: null,
    ':ua' => $userAgent,
    ':ip' => $ip
  ]);

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

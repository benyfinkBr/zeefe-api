<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $clientId = isset($data['client_id']) ? (int)$data['client_id'] : 0;
  if ($clientId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'client_id obrigatório']);
    exit;
  }

  // Procura um thread de suporte existente (sem sala / reserva, advertiser_id NULL ou 0 legado)
  $stmt = $pdo->prepare(
    'SELECT id FROM message_threads 
     WHERE client_id = :cli 
       AND (advertiser_id IS NULL OR advertiser_id = 0) 
       AND room_id IS NULL 
       AND reservation_id IS NULL 
     ORDER BY created_at ASC 
     LIMIT 1'
  );
  $stmt->execute([':cli' => $clientId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if ($row && isset($row['id'])) {
    echo json_encode(['success' => true, 'id' => (int)$row['id']]);
    exit;
  }

  // Cria um novo thread de suporte (advertiser_id NULL para não quebrar FK)
  $ins = $pdo->prepare(
    'INSERT INTO message_threads (room_id, reservation_id, client_id, advertiser_id, created_at) 
     VALUES (NULL, NULL, :cli, NULL, NOW())'
  );
  $ins->execute([':cli' => $clientId]);
  $id = (int)$pdo->lastInsertId();

  echo json_encode(['success' => true, 'id' => $id]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

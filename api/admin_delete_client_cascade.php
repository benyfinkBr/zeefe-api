<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $data = getJsonInput();
  $clientId = (int)($data['client_id'] ?? 0);
  if ($clientId <= 0) {
    throw new RuntimeException('Informe o client_id.');
  }

  $pdo->beginTransaction();

  // Reserva IDs para deleção em cascata manual
  $stmtRes = $pdo->prepare('SELECT id FROM reservations WHERE client_id = :cid');
  $stmtRes->execute([':cid' => $clientId]);
  $reservationIds = $stmtRes->fetchAll(PDO::FETCH_COLUMN);

  if ($reservationIds) {
    $placeholders = implode(',', array_fill(0, count($reservationIds), '?'));

    // Dependentes de reservas
    $pdo->prepare("DELETE FROM ledger_entries WHERE reservation_id IN ($placeholders)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM messages WHERE reservation_id IN ($placeholders)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM notification_logs WHERE reservation_id IN ($placeholders)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM reservation_visitors WHERE reservation_id IN ($placeholders)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM payments WHERE reservation_id IN ($placeholders)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM feedback_nps WHERE reservation_id IN ($placeholders)")->execute($reservationIds);

    // pré-reservas vinculadas por conversão
    $pdo->prepare("DELETE FROM pre_reservations WHERE converted_reservation_id IN ($placeholders)")->execute($reservationIds);

    // Finalmente reservas
    $pdo->prepare("DELETE FROM reservations WHERE id IN ($placeholders)")->execute($reservationIds);
  }

  // Dependentes diretos do cliente
  $tablesClientId = [
    'customer_cards',
    'client_addresses',
    'client_remember_tokens',
    'associates',
    'events',
    'messages',
    'message_threads',
    'pre_reservations',
    'reviews',
    'visitors'
  ];
  foreach ($tablesClientId as $table) {
    $stmt = $pdo->prepare("DELETE FROM {$table} WHERE client_id = :cid");
    $stmt->execute([':cid' => $clientId]);
  }

  // Companies onde é master -> desvincula
  $pdo->prepare('UPDATE companies SET master_client_id = NULL WHERE master_client_id = :cid')->execute([':cid' => $clientId]);

  // Finalmente cliente
  $stmtDelClient = $pdo->prepare('DELETE FROM clients WHERE id = :cid');
  $stmtDelClient->execute([':cid' => $clientId]);

  $pdo->commit();

  echo json_encode(['success' => true, 'deleted_client_id' => $clientId]);
} catch (Throwable $e) {
  if ($pdo && $pdo->inTransaction()) {
    $pdo->rollBack();
  }
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

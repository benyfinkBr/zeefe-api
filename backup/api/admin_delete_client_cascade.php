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

  // Coleta reservas do cliente
  $stmtRes = $pdo->prepare('SELECT id FROM reservations WHERE client_id = :cid');
  $stmtRes->execute([':cid' => $clientId]);
  $reservationIds = $stmtRes->fetchAll(PDO::FETCH_COLUMN);

  // Coleta threads de mensagens do cliente ou vinculadas às reservas
  $threadIds = [];
  $threadStmt = $pdo->prepare('SELECT id FROM message_threads WHERE client_id = :cid');
  $threadStmt->execute([':cid' => $clientId]);
  $threadIds = $threadStmt->fetchAll(PDO::FETCH_COLUMN);
  if ($reservationIds) {
    $in = implode(',', array_fill(0, count($reservationIds), '?'));
    $threadResStmt = $pdo->prepare("SELECT id FROM message_threads WHERE reservation_id IN ($in)");
    $threadResStmt->execute($reservationIds);
    $threadIds = array_merge($threadIds, $threadResStmt->fetchAll(PDO::FETCH_COLUMN));
  }
  $threadIds = array_values(array_unique(array_filter($threadIds)));

  // Deleta mensagens antes de threads
  if ($threadIds) {
    $in = implode(',', array_fill(0, count($threadIds), '?'));
    $pdo->prepare("DELETE FROM messages WHERE thread_id IN ($in)")->execute($threadIds);
    $pdo->prepare("DELETE FROM message_threads WHERE id IN ($in)")->execute($threadIds);
  }

  // Dependentes das reservas
  if ($reservationIds) {
    $inRes = implode(',', array_fill(0, count($reservationIds), '?'));
    $pdo->prepare("DELETE FROM ledger_entries WHERE reservation_id IN ($inRes)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM notification_logs WHERE reservation_id IN ($inRes)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM payments WHERE reservation_id IN ($inRes)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM feedback_nps WHERE reservation_id IN ($inRes)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM reservation_visitors WHERE reservation_id IN ($inRes)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM reviews WHERE reservation_id IN ($inRes)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM pre_reservations WHERE converted_reservation_id IN ($inRes)")->execute($reservationIds);
    $pdo->prepare("DELETE FROM reservations WHERE id IN ($inRes)")->execute($reservationIds);
  }

  // Dependentes diretos por client_id
  $tablesClientId = [
    'customer_cards',
    'client_addresses',
    'client_remember_tokens',
    'associates',
    'events',
    'pre_reservations',
    'reviews',
    'visitors'
  ];
  foreach ($tablesClientId as $table) {
    $stmt = $pdo->prepare("DELETE FROM {$table} WHERE client_id = :cid");
    $stmt->execute([':cid' => $clientId]);
  }

  // Desvincula company master
  $pdo->prepare('UPDATE companies SET master_client_id = NULL WHERE master_client_id = :cid')->execute([':cid' => $clientId]);

  // Remove cliente
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

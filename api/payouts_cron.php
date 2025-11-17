<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $upd = $pdo->prepare("UPDATE ledger_entries SET status = 'disponivel' WHERE status = 'pendente' AND available_at IS NOT NULL AND available_at <= NOW()");
  $upd->execute();
  echo json_encode(['success'=>true,'updated'=>$upd->rowCount()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}


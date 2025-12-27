<?php
require 'apiconfig.php';

$data = getJsonInput();
$table = preg_replace('/[^a-z_]/', '', $data['table'] ?? '');
$id    = intval($data['id'] ?? 0);

if (!$table || !$id) {
  echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
  exit;
}

try {
  $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = :id");
  $stmt->execute([':id' => $id]);

  echo json_encode(['success' => true]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

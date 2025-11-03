<?php
require 'apiconfig.php';

$data = getJsonInput();
$table = preg_replace('/[^a-z_]/', '', $data['table'] ?? '');
$row   = $data['data'] ?? [];
$id    = intval($row['id'] ?? 0);
unset($row['id']);

if (!$table || !$id) {
  echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
  exit;
}

try {
  $set = implode(',', array_map(fn($k) => "$k=:$k", array_keys($row)));
  $sql = "UPDATE `$table` SET $set WHERE id=:id";
  $stmt = $pdo->prepare($sql);
  $row['id'] = $id;
  $stmt->execute($row);

  echo json_encode(['success' => true]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

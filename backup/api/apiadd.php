<?php
require 'apiconfig.php';

$data = getJsonInput();
$table = preg_replace('/[^a-z_]/', '', $data['table'] ?? '');
$row   = $data['data'] ?? [];

if (!$table || !is_array($row)) {
  echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
  exit;
}

try {
  $cols = array_keys($row);
  $sql  = "INSERT INTO `$table` (" . implode(',', $cols) . ") VALUES (:" . implode(',:', $cols) . ")";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($row);

  echo json_encode(['success' => true, 'insertId' => $pdo->lastInsertId()]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

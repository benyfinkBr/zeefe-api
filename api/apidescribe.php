<?php
require 'apiconfig.php';

$table = preg_replace('/[^a-z_]/', '', $_GET['table'] ?? '');
if (!$table) {
  echo json_encode(['success' => false, 'error' => 'Tabela inválida.']);
  exit;
}

try {
  $stmt = $pdo->query("DESCRIBE `$table`");
  $columns = $stmt->fetchAll();
  echo json_encode(['success' => true, 'columns' => $columns]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

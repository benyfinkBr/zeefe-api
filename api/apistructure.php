<?php
require 'apiconfig.php';
$table = preg_replace('/[^a-z_]/', '', $_GET['table'] ?? '');
if (!$table) {
    echo json_encode(['success'=>false,'error'=>'Tabela inválida']);
    exit;
}

try {
    $stmt = $pdo->query("DESCRIBE `$table`");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success'=>true,'columns'=>$cols]);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
?>

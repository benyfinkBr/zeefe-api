<?php
header('Content-Type: application/json');
require_once 'apiconfig.php';

try {
    $stmt = $pdo->prepare("SELECT id, name, capacity, description, daily_rate, location, status, photo_path FROM rooms WHERE status='ativo'");
    $stmt->execute();
    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $rooms
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao buscar salas: ' . $e->getMessage()
    ]);
}
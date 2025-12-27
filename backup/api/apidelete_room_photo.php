<?php
require 'apiconfig.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Método não permitido']);
  exit;
}

$data = getJsonInput();
$roomId = isset($data['roomId']) ? (int) $data['roomId'] : 0;
$photo = trim($data['photo'] ?? '');

if ($roomId <= 0 || $photo === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Dados inválidos']);
  exit;
}

$photo = ltrim($photo, '/');

if (strpos($photo, 'img/rooms/') !== 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Caminho de foto inválido']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT photo_path FROM rooms WHERE id = ? LIMIT 1');
  $stmt->execute([$roomId]);
  $current = $stmt->fetchColumn();
  if ($current === false) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Sala não encontrada']);
    exit;
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao consultar sala: ' . $e->getMessage()]);
  exit;
}

$paths = $current ? array_values(array_filter(array_map('trim', explode(',', $current)))) : [];

if (!in_array($photo, $paths, true)) {
  echo json_encode(['success' => false, 'error' => 'Foto não vinculada à sala', 'photo_path' => $current]);
  exit;
}

$baseDir = realpath(__DIR__ . '/../');
if ($baseDir === false) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Diretório base não encontrado']);
  exit;
}

$fullPath = realpath($baseDir . '/' . $photo);
if ($fullPath && strpos($fullPath, $baseDir . '/img/rooms/') === 0 && is_file($fullPath)) {
  @unlink($fullPath);
}

$paths = array_values(array_filter($paths, fn($p) => $p !== $photo));
$newValue = $paths ? implode(',', $paths) : null;

try {
  $update = $pdo->prepare('UPDATE rooms SET photo_path = ? WHERE id = ?');
  $update->execute([$newValue, $roomId]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao atualizar a sala: ' . $e->getMessage()]);
  exit;
}

echo json_encode([
  'success' => true,
  'photo_path' => $newValue
]);

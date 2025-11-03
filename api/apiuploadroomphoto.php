<?php
require 'apiconfig.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Método não permitido']);
  exit;
}

$roomId = isset($_POST['id']) ? (int) $_POST['id'] : 0;
if ($roomId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'ID da sala inválido']);
  exit;
}

if (!isset($_FILES['files'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Nenhum arquivo enviado']);
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

$existingPaths = [];
if ($current) {
  $existingPaths = array_values(array_filter(array_map('trim', explode(',', $current))));
}

$baseDir = realpath(__DIR__ . '/../img');
if ($baseDir === false) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Diretório base de imagens não existe']);
  exit;
}

$roomDir = $baseDir . '/rooms/' . $roomId;
if (!is_dir($roomDir) && !mkdir($roomDir, 0755, true)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Não foi possível criar o diretório da sala']);
  exit;
}

$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$maxFileSize = 8 * 1024 * 1024; // 8 MB
$uploaded = [];

$files = $_FILES['files'];
$count = is_array($files['name']) ? count($files['name']) : 0;

for ($i = 0; $i < $count; $i++) {
  $error = $files['error'][$i] ?? UPLOAD_ERR_NO_FILE;
  if ($error !== UPLOAD_ERR_OK) {
    continue;
  }

  $tmpName = $files['tmp_name'][$i] ?? '';
  if (!$tmpName || !is_uploaded_file($tmpName)) {
    continue;
  }

  $size = $files['size'][$i] ?? 0;
  if ($size <= 0 || $size > $maxFileSize) {
    continue;
  }

  $originalName = $files['name'][$i] ?? 'arquivo';
  $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
  if (!in_array($ext, $allowedExtensions, true)) {
    continue;
  }

  $safeName = uniqid('room_' . $roomId . '_', true) . '.' . $ext;
  $destination = $roomDir . '/' . $safeName;

  if (!move_uploaded_file($tmpName, $destination)) {
    continue;
  }

  $relativePath = 'img/rooms/' . $roomId . '/' . $safeName;
  $uploaded[] = $relativePath;
}

if (!$uploaded) {
  echo json_encode(['success' => false, 'error' => 'Nenhum arquivo válido foi processado']);
  exit;
}

$finalPaths = array_values(array_unique(array_merge($existingPaths, $uploaded)));
$newValue = implode(',', $finalPaths);

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
  'uploaded' => $uploaded,
  'photo_path' => $newValue
]);

<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Método não permitido']);
  exit;
}

$workshopId = isset($_POST['id']) ? (int) $_POST['id'] : 0;
if ($workshopId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'ID do workshop inválido']);
  exit;
}

if (!isset($_FILES['file'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Nenhum arquivo enviado']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT advertiser_id FROM workshops WHERE id = ? LIMIT 1');
  $stmt->execute([$workshopId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Workshop não encontrado']);
    exit;
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao consultar workshop: ' . $e->getMessage()]);
  exit;
}

$baseDir = realpath(__DIR__ . '/../img');
if ($baseDir === false) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Diretório base de imagens não existe']);
  exit;
}

$wsDir = $baseDir . '/workshops/' . $workshopId;
if (!is_dir($wsDir) && !mkdir($wsDir, 0755, true)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Não foi possível criar o diretório do workshop']);
  exit;
}

$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$allowedMimes = ['image/jpeg','image/png','image/gif','image/webp'];
$maxFileSize = 5 * 1024 * 1024; // 5 MB

$file = $_FILES['file'];
$error = $file['error'] ?? UPLOAD_ERR_NO_FILE;
if ($error !== UPLOAD_ERR_OK) {
  echo json_encode(['success' => false, 'error' => 'Erro no upload do arquivo']);
  exit;
}

$tmpName = $file['tmp_name'] ?? '';
if (!$tmpName || !is_uploaded_file($tmpName)) {
  echo json_encode(['success' => false, 'error' => 'Arquivo inválido']);
  exit;
}

$size = $file['size'] ?? 0;
if ($size <= 0 || $size > $maxFileSize) {
  echo json_encode(['success' => false, 'error' => 'Arquivo muito grande']);
  exit;
}

$originalName = $file['name'] ?? 'arquivo';
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExtensions, true)) {
  echo json_encode(['success' => false, 'error' => 'Extensão inválida']);
  exit;
}

$fi = new finfo(FILEINFO_MIME_TYPE);
$mime = $fi->file($tmpName) ?: '';
if (!in_array($mime, $allowedMimes, true)) {
  echo json_encode(['success' => false, 'error' => 'Tipo de arquivo inválido']);
  exit;
}

$safeName = uniqid('ws_' . $workshopId . '_', true) . '.' . $ext;
$destination = $wsDir . '/' . $safeName;

if (!move_uploaded_file($tmpName, $destination)) {
  echo json_encode(['success' => false, 'error' => 'Falha ao mover arquivo']);
  exit;
}

$relativePath = 'img/workshops/' . $workshopId . '/' . $safeName;

try {
  $upd = $pdo->prepare('UPDATE workshops SET banner_path = ? WHERE id = ?');
  $upd->execute([$relativePath, $workshopId]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao atualizar workshop: ' . $e->getMessage()]);
  exit;
}

echo json_encode([
  'success' => true,
  'banner_path' => $relativePath
]);


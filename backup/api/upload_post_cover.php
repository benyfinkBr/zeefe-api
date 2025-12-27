<?php
require_once 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
  }

  $id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
  if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
  }

  if (empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Nenhum arquivo enviado']);
    exit;
  }

  $file = $_FILES['file'];
  if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Erro no upload']);
    exit;
  }

  $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
  $type = mime_content_type($file['tmp_name']);
  if (!isset($allowed[$type])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Formato de imagem não suportado']);
    exit;
  }

  $ext = $allowed[$type];
  $baseDir = dirname(__DIR__) . '/img/posts/' . $id;
  if (!is_dir($baseDir)) {
    mkdir($baseDir, 0775, true);
  }

  $filename = 'cover.' . $ext;
  $targetPath = $baseDir . '/' . $filename;

  if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Falha ao salvar a imagem']);
    exit;
  }

  // Caminho relativo para uso no front
  $relativePath = 'img/posts/' . $id . '/' . $filename;

  $stmt = $pdo->prepare('UPDATE posts SET cover_path = :cover WHERE id = :id');
  $stmt->execute([':cover' => $relativePath, ':id' => $id]);

  echo json_encode(['success' => true, 'cover_path' => $relativePath]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}


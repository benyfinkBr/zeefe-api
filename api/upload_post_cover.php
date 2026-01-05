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

  $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/x-png' => 'png', 'image/webp' => 'webp'];
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

  $maxSize = 1200;
  $resizeError = null;
  if (function_exists('imagecreatetruecolor') && function_exists('getimagesize')) {
    $info = @getimagesize($targetPath);
    if ($info && !empty($info[0]) && !empty($info[1])) {
      $width = (int)$info[0];
      $height = (int)$info[1];
      $largest = max($width, $height);
      if ($largest > $maxSize) {
        $scale = $maxSize / $largest;
        $newWidth = (int)round($width * $scale);
        $newHeight = (int)round($height * $scale);
        $src = null;
        if ($ext === 'jpg') {
          $src = @imagecreatefromjpeg($targetPath);
        } elseif ($ext === 'png') {
          $src = @imagecreatefrompng($targetPath);
        } elseif ($ext === 'webp') {
          $src = @imagecreatefromwebp($targetPath);
        }
        if ($src) {
          $dst = imagecreatetruecolor($newWidth, $newHeight);
          if ($ext === 'png') {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
          }
          if (imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height)) {
            if ($ext === 'jpg') {
              imagejpeg($dst, $targetPath, 82);
            } elseif ($ext === 'png') {
              imagepng($dst, $targetPath, 6);
            } elseif ($ext === 'webp') {
              imagewebp($dst, $targetPath, 82);
            }
          } else {
            $resizeError = 'Falha ao redimensionar.';
          }
          imagedestroy($dst);
          imagedestroy($src);
        } else {
          $resizeError = 'Falha ao abrir a imagem.';
        }
      }
    }
  } else {
    $resizeError = 'Biblioteca de imagem indisponível.';
  }

  // Caminho relativo para uso no front
  $relativePath = 'img/posts/' . $id . '/' . $filename;

  $stmt = $pdo->prepare('UPDATE posts SET cover_path = :cover WHERE id = :id');
  $stmt->execute([':cover' => $relativePath, ':id' => $id]);

  echo json_encode([
    'success' => true,
    'cover_path' => $relativePath,
    'resize_warning' => $resizeError
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

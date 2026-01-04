<?php
require 'apiconfig.php';

// --- Permite apenas POST ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success'=>false,'error'=>'Método não permitido']);
  exit;
}

// --- Lê dados do corpo JSON ---
$data = getJsonInput();
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');
$remember = !empty($data['remember']);

if (!$username || !$password) {
  echo json_encode(['success'=>false,'error'=>'Usuário e senha são obrigatórios.']);
  exit;
}

try {
  $stmt = $pdo->prepare("
    SELECT a.*, p.name AS profile_name, p.permissions_json
    FROM admins a
    LEFT JOIN admin_profiles p ON p.id = a.profile_id
    WHERE a.username = :username OR a.email = :email
    LIMIT 1
  ");
  $stmt->execute([
    ':username' => $username,
    ':email' => $username
  ]);
  $user = $stmt->fetch();

  if (!$user) {
    echo json_encode(['success'=>false,'error'=>'Usuário ou senha inválidos.']);
    exit;
  }

  if (!empty($user['status']) && in_array(strtolower($user['status']), ['inativo','bloqueado'], true)) {
    echo json_encode(['success'=>false,'error'=>'Conta inativa.']);
    exit;
  }

  $valid = false;
  $hash = (string)($user['password_hash'] ?? '');
  if ($hash) {
    $info = password_get_info($hash);
    if (($info['algo'] ?? 0) !== 0) {
      $valid = password_verify($password, $hash);
    }
  }

  if (!$valid) {
    $legacy = (string)($user['password'] ?? '');
    if ($legacy) {
      $legacyInfo = password_get_info($legacy);
      if (($legacyInfo['algo'] ?? 0) !== 0) {
        $valid = password_verify($password, $legacy);
      } else {
        $valid = hash_equals($legacy, $password);
      }
      if ($valid && empty($user['password_hash'])) {
        try {
          $newHash = password_hash($password, PASSWORD_DEFAULT);
          $upd = $pdo->prepare('UPDATE admins SET password_hash = :hash, password = :hash WHERE id = :id');
          $upd->execute([':hash' => $newHash, ':id' => $user['id']]);
          $user['password_hash'] = $newHash;
        } catch (Throwable $e) {
          // Mantém login válido mesmo se falhar a atualização do hash
        }
      }
    }
  }

  if (!$valid) {
    echo json_encode(['success'=>false,'error'=>'Usuário ou senha inválidos.']);
    exit;
  }

  $rememberPayload = null;
  if ($remember) {
    try {
      $rawToken = bin2hex(random_bytes(32));
      $tokenHash = hash('sha256', $rawToken);
      $expiresAt = (new DateTimeImmutable('+24 hours'))->format('Y-m-d H:i:s');
      $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
      $ins = $pdo->prepare('INSERT INTO admin_remember_tokens (admin_id, token_hash, user_agent, expires_at, created_at) VALUES (:aid,:hash,:ua,:exp,NOW())');
      $ins->execute([
        ':aid' => $user['id'],
        ':hash' => $tokenHash,
        ':ua' => $ua,
        ':exp' => $expiresAt
      ]);
      $rememberPayload = [
        'token' => $rawToken,
        'expires_at' => $expiresAt
      ];
    } catch (Throwable $e) {
      error_log('Erro ao gerar remember token admin: ' . $e->getMessage());
    }
  }

  session_regenerate_id(true);
  $_SESSION['admin_id'] = (int) $user['id'];
  $_SESSION['admin_name'] = $user['name'] ?? $user['username'] ?? 'Admin';
  $_SESSION['auth'] = [
    'logged_in' => true,
    'user_id' => (int) $user['id'],
    'name' => $_SESSION['admin_name'],
    'email' => $user['email'] ?? '',
    'role' => 'admin',
    'ts' => time(),
  ];

  echo json_encode([
    'success'=>true,
    'admin' => [
      'id' => (int) $user['id'],
      'name' => $user['name'] ?? null,
      'username' => $user['username'] ?? null,
      'email' => $user['email'] ?? null,
      'profile_id' => isset($user['profile_id']) ? (int) $user['profile_id'] : null,
      'profile_name' => $user['profile_name'] ?? null,
      'permissions_json' => $user['permissions_json'] ?? null,
      'status' => $user['status'] ?? null,
      'is_master' => !empty($user['is_master']) ? 1 : 0
    ],
    'remember' => $rememberPayload
  ]);
} catch (Exception $e) {
  echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
?>

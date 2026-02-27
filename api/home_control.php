<?php
require_once __DIR__ . '/apiconfig.php';

header('Content-Type: application/json; charset=UTF-8');

if (!$pdo) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Banco de dados indisponível.']);
  exit;
}

if (empty($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Não autorizado.']);
  exit;
}

function home_control_admin_can(PDO $pdo, int $adminId, string $action): bool {
  try {
    $stmt = $pdo->prepare('SELECT a.is_master, p.permissions_json FROM admins a LEFT JOIN admin_profiles p ON p.id = a.profile_id WHERE a.id = :id LIMIT 1');
    $stmt->execute([':id' => $adminId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return false;
    if (!empty($row['is_master'])) return true;

    $raw = $row['permissions_json'] ?? null;
    if (!$raw) return false;
    if (is_string($raw)) {
      $raw = json_decode($raw, true);
    }
    if (!is_array($raw)) return false;

    $perms = $raw['home_control'] ?? [];
    return !empty($perms[$action]);
  } catch (Throwable $e) {
    return false;
  }
}

function home_control_ensure_table(PDO $pdo): void {
  $sql = "CREATE TABLE IF NOT EXISTS app_settings (
    `key` VARCHAR(120) NOT NULL,
    `value` TEXT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by_admin_id` INT NULL,
    PRIMARY KEY (`key`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
  $pdo->exec($sql);
}

function home_control_read_enabled(PDO $pdo): bool {
  home_control_ensure_table($pdo);
  $stmt = $pdo->prepare("SELECT `value` FROM app_settings WHERE `key` = 'home_live_enabled' LIMIT 1");
  $stmt->execute();
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) return false;

  $value = strtolower(trim((string)($row['value'] ?? '0')));
  return in_array($value, ['1', 'true', 'yes', 'on'], true);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$adminId = (int) $_SESSION['admin_id'];

try {
  if ($method === 'GET') {
    if (!home_control_admin_can($pdo, $adminId, 'read')) {
      http_response_code(403);
      echo json_encode(['success' => false, 'error' => 'Sem permissão.']);
      exit;
    }

    $enabled = home_control_read_enabled($pdo);
    echo json_encode(['success' => true, 'enabled' => $enabled]);
    exit;
  }

  if ($method === 'POST') {
    if (!home_control_admin_can($pdo, $adminId, 'update')) {
      http_response_code(403);
      echo json_encode(['success' => false, 'error' => 'Sem permissão para alterar.']);
      exit;
    }

    $input = getJsonInput();
    if (!array_key_exists('enabled', $input)) {
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => 'Campo enabled é obrigatório.']);
      exit;
    }

    $enabled = filter_var($input['enabled'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($enabled === null) {
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => 'Valor enabled inválido.']);
      exit;
    }

    home_control_ensure_table($pdo);
    $stmt = $pdo->prepare("INSERT INTO app_settings (`key`, `value`, updated_by_admin_id)
      VALUES ('home_live_enabled', :value, :admin_id)
      ON DUPLICATE KEY UPDATE
        `value` = VALUES(`value`),
        updated_by_admin_id = VALUES(updated_by_admin_id),
        updated_at = CURRENT_TIMESTAMP");
    $stmt->execute([
      ':value' => $enabled ? '1' : '0',
      ':admin_id' => $adminId
    ]);

    echo json_encode(['success' => true, 'enabled' => $enabled]);
    exit;
  }

  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro ao processar controle da home.']);
}

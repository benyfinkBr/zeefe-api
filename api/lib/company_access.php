<?php

function zeefe_company_has_is_active(PDO $pdo): bool
{
  static $hasColumn = null;
  if ($hasColumn !== null) {
    return $hasColumn;
  }
  try {
    $stmt = $pdo->prepare("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'is_active' LIMIT 1");
    $stmt->execute();
    $hasColumn = (bool) $stmt->fetchColumn();
  } catch (Throwable $e) {
    $hasColumn = false;
  }
  return $hasColumn;
}

function zeefe_get_company(PDO $pdo, int $companyId): ?array
{
  if ($companyId <= 0) return null;
  if (zeefe_company_has_is_active($pdo)) {
    $stmt = $pdo->prepare('SELECT id, status, is_active FROM companies WHERE id = :id LIMIT 1');
  } else {
    $stmt = $pdo->prepare('SELECT id, status, NULL AS is_active FROM companies WHERE id = :id LIMIT 1');
  }
  $stmt->execute([':id' => $companyId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  return $row ?: null;
}

function zeefe_company_is_active(array $company): bool
{
  if (array_key_exists('is_active', $company) && $company['is_active'] !== null) {
    return (int) $company['is_active'] === 1;
  }
  $status = isset($company['status']) ? strtolower((string) $company['status']) : '';
  if ($status === '') return true;
  return $status === 'ativo';
}

function zeefe_check_company_active(PDO $pdo, int $companyId): array
{
  $company = zeefe_get_company($pdo, $companyId);
  if (!$company) {
    return ['ok' => false, 'error' => 'Empresa não encontrada.'];
  }
  if (!zeefe_company_is_active($company)) {
    return ['ok' => false, 'error' => 'Empresa inativa.'];
  }
  return ['ok' => true, 'company' => $company];
}

function zeefe_require_active_company(PDO $pdo, int $companyId): bool
{
  $check = zeefe_check_company_active($pdo, $companyId);
  if ($check['ok']) return true;
  $error = $check['error'] ?? 'Empresa inválida.';
  http_response_code(str_contains($error, 'não encontrada') ? 404 : 403);
  echo json_encode(['success' => false, 'error' => $error]);
  return false;
}

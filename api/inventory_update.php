<?php
require 'apiconfig.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Método não permitido']);
  exit;
}

session_set_cookie_params([
  'lifetime' => 0,
  'path' => '/',
  'domain' => '',
  'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
  'httponly' => true,
  'samesite' => 'Lax'
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
  session_start();
}

if (empty($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Não autenticado']);
  exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
$token = trim($payload['token'] ?? '');
$record = $payload['record'] ?? null;

if (!$token || !is_array($record)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Dados inválidos']);
  exit;
}

$allowed = [
  'id_patrimonio','codigo_patrimonio','descricao','categoria','marca','modelo','numero_serie',
  'data_aquisicao','fornecedor','nota_fiscal','valor_aquisicao','forma_aquisicao','unidade',
  'setor','localizacao_endereco','localizacao_cep','localizacao_complemento','responsavel',
  'status','condicao','data_ultimo_inventario','vida_util_anos','taxa_depreciacao','valor_contabil',
  'centro_custo','garantia_ate','historico_manutencao','custo_manutencao','data_baixa',
  'motivo_baixa','valor_baixa'
];

$clean = [];
foreach ($record as $key => $value) {
  if (!in_array($key, $allowed, true)) {
    continue;
  }
  $clean[$key] = $value === '' ? null : $value;
}

if (!$clean) {
  echo json_encode(['success' => true, 'message' => 'Nada para atualizar']);
  exit;
}

try {
  $cols = [];
  $params = [':token' => $token];
  foreach ($clean as $col => $val) {
    $cols[] = "`$col` = :$col";
    $params[":$col"] = $val;
  }
  $cols[] = "updated_at = NOW()";
  $sql = "UPDATE inventory_items SET " . implode(', ', $cols) . " WHERE qr_token = :token";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

<?php
require 'apiconfig.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;
$name = trim($data['name'] ?? '');
$login = trim($data['login'] ?? '');
$phone = preg_replace('/\D/', '', $data['phone'] ?? '');
$whatsapp = preg_replace('/\D/', '', $data['whatsapp'] ?? '');
$address = [
  'street' => trim($data['street'] ?? ''),
  'number' => trim($data['number'] ?? ''),
  'complement' => trim($data['complement'] ?? ''),
  'zip_code' => preg_replace('/\D/', '', $data['zip_code'] ?? ''),
  'city' => trim($data['city'] ?? ''),
  'state' => trim($data['state'] ?? ''),
  'country' => trim($data['country'] ?? 'BR')
];

function saveClientAddress(PDO $pdo, int $clientId, array $address): array {
  $clean = [
    'street' => trim($address['street'] ?? ''),
    'number' => trim($address['number'] ?? ''),
    'complement' => trim($address['complement'] ?? ''),
    'zip_code' => preg_replace('/\D/', '', $address['zip_code'] ?? ''),
    'city' => trim($address['city'] ?? ''),
    'state' => trim($address['state'] ?? ''),
    'country' => trim($address['country'] ?? 'BR')
  ];

  $stmt = $pdo->prepare('SELECT id FROM client_addresses WHERE client_id = :id ORDER BY updated_at DESC, id DESC LIMIT 1');
  $stmt->execute([':id' => $clientId]);
  $addrId = $stmt->fetchColumn();

  if ($addrId) {
    $upd = $pdo->prepare('UPDATE client_addresses SET street = :street, number = :number, complement = :complement, zip_code = :zip_code, city = :city, state = :state, country = :country, updated_at = NOW() WHERE id = :id');
    $upd->execute([
      ':street' => $clean['street'],
      ':number' => $clean['number'],
      ':complement' => $clean['complement'],
      ':zip_code' => $clean['zip_code'],
      ':city' => $clean['city'],
      ':state' => $clean['state'],
      ':country' => $clean['country'],
      ':id' => $addrId
    ]);
  } else {
    $ins = $pdo->prepare('INSERT INTO client_addresses (client_id, street, number, complement, zip_code, city, state, country, created_at, updated_at) VALUES (:client_id, :street, :number, :complement, :zip_code, :city, :state, :country, NOW(), NOW())');
    $ins->execute([
      ':client_id' => $clientId,
      ':street' => $clean['street'],
      ':number' => $clean['number'],
      ':complement' => $clean['complement'],
      ':zip_code' => $clean['zip_code'],
      ':city' => $clean['city'],
      ':state' => $clean['state'],
      ':country' => $clean['country']
    ]);
  }

  return $clean;
}

if ($id <= 0 || $name === '' || $login === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
  exit;
}

if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['client_id']) && (int)$_SESSION['client_id'] !== $id) {
  http_response_code(403);
  echo json_encode(['success' => false, 'error' => 'Sessão inválida.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT COUNT(*) FROM clients WHERE login = :login AND id <> :id');
  $stmt->execute([':login' => $login, ':id' => $id]);
  if ($stmt->fetchColumn() > 0) {
    echo json_encode(['success' => false, 'error' => 'Este login já está em uso.']);
    exit;
  }

  $stmtUpd = $pdo->prepare('UPDATE clients SET name = :name, login = :login, phone = :phone, whatsapp = :whatsapp, updated_at = NOW() WHERE id = :id');
  $stmtUpd->execute([
    ':name' => $name,
    ':login' => $login,
    ':phone' => $phone ?: null,
    ':whatsapp' => $whatsapp ?: null,
    ':id' => $id
  ]);

  $stmtGet = $pdo->prepare('SELECT id, name, email, login, cpf, phone, whatsapp, company_id, pagarme_customer_id FROM clients WHERE id = :id LIMIT 1');
  $stmtGet->execute([':id' => $id]);
  $client = $stmtGet->fetch(PDO::FETCH_ASSOC);

  if (!$client) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Cliente não encontrado.']);
    exit;
  }

  $addressSaved = saveClientAddress($pdo, $id, $address);

  echo json_encode([
    'success' => true,
    'message' => 'Dados atualizados com sucesso.',
    'client' => [
      'id' => (int) $client['id'],
      'name' => $client['name'],
      'email' => $client['email'],
      'login' => $client['login'],
      'cpf' => $client['cpf'],
      'phone' => $client['phone'],
      'whatsapp' => $client['whatsapp'],
      'company_id' => $client['company_id'],
      'address' => $addressSaved
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

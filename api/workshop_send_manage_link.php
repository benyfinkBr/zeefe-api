<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $body = json_decode(file_get_contents('php://input'), true);
  if (!$body) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Requisicao invalida.']);
    exit;
  }

  $workshopId = isset($body['workshop_id']) ? (int)$body['workshop_id'] : 0;
  if ($workshopId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Workshop invalido.']);
    exit;
  }

  $advertiserId = isset($_SESSION['advertiser_id']) ? (int)$_SESSION['advertiser_id'] : 0;
  if ($advertiserId <= 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Nao autorizado.']);
    exit;
  }

  $stmt = $pdo->prepare('
    SELECT w.title, a.login_email, a.display_name
    FROM workshops w
    JOIN advertisers a ON a.id = w.advertiser_id
    WHERE w.id = :wid AND w.advertiser_id = :aid
    LIMIT 1
  ');
  $stmt->execute([':wid' => $workshopId, ':aid' => $advertiserId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Workshop nao encontrado.']);
    exit;
  }

  $email = $row['login_email'] ?? '';
  if ($email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Anunciante sem e-mail configurado.']);
    exit;
  }

  $manageUrl = 'https://zeefe.com.br/anunciante-mobile.html?redirect=convidados&workshop_id=' . urlencode((string)$workshopId);
  $html = mailer_render('workshop_manage_link.php', [
    'workshop_title' => $row['title'] ?? 'Workshop',
    'manage_url' => $manageUrl
  ]);
  $ok = mailer_send([['email' => $email, 'name' => $row['display_name'] ?? 'Anunciante']], 'Link de gestão do workshop', $html);

  echo json_encode(['success' => $ok, 'email' => $email]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

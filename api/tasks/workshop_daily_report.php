<?php
require_once __DIR__ . '/../apiconfig.php';
require_once __DIR__ . '/../lib/mailer.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $sql = "
    SELECT
      w.id,
      w.title,
      w.date,
      w.min_seats,
      w.status,
      a.id AS advertiser_id,
      a.display_name,
      a.login_email,
      (SELECT COUNT(*) FROM workshop_enrollments e WHERE e.workshop_id = w.id AND e.payment_status <> 'cancelado') AS active_seats
    FROM workshops w
    JOIN advertisers a ON a.id = w.advertiser_id
    WHERE w.status IN ('publicado','rascunho')
    ORDER BY a.id, w.date ASC
  ";
  $stmt = $pdo->query($sql);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $grouped = [];
  foreach ($rows as $row) {
    $advId = (int)$row['advertiser_id'];
    if (!isset($grouped[$advId])) {
      $grouped[$advId] = [
        'advertiser' => $row,
        'workshops' => []
      ];
    }
    $grouped[$advId]['workshops'][] = $row;
  }

  $sent = 0;
  foreach ($grouped as $advId => $group) {
    $email = $group['advertiser']['login_email'] ?? '';
    if ($email === '') continue;
    $name = $group['advertiser']['display_name'] ?? 'Anunciante';
    $rowsHtml = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">';
    $rowsHtml .= '<tr><th align="left" style="padding:8px 0;border-bottom:1px solid #E6DED4;">Workshop</th><th align="left" style="padding:8px 0;border-bottom:1px solid #E6DED4;">Data</th><th align="left" style="padding:8px 0;border-bottom:1px solid #E6DED4;">Inscritos</th><th align="left" style="padding:8px 0;border-bottom:1px solid #E6DED4;">Faltam</th><th align="left" style="padding:8px 0;border-bottom:1px solid #E6DED4;">Gestao</th></tr>';
    foreach ($group['workshops'] as $ws) {
      $min = (int)($ws['min_seats'] ?? 0);
      $active = (int)($ws['active_seats'] ?? 0);
      $missing = ($min > 0) ? max(0, $min - $active) : 0;
      $manageUrl = 'https://zeefe.com.br/anunciante-convidados.html?workshop_id=' . urlencode((string)($ws['id'] ?? ''));
      $rowsHtml .= sprintf(
        '<tr><td style="padding:8px 0;border-bottom:1px solid #F0EAE2;">%s</td><td style="padding:8px 0;border-bottom:1px solid #F0EAE2;">%s</td><td style="padding:8px 0;border-bottom:1px solid #F0EAE2;">%d</td><td style="padding:8px 0;border-bottom:1px solid #F0EAE2;">%d</td><td style="padding:8px 0;border-bottom:1px solid #F0EAE2;"><a href="%s" style="color:#1D413A;font-weight:600;text-decoration:none;">Gerenciar</a></td></tr>',
        htmlspecialchars($ws['title'] ?? 'Workshop', ENT_QUOTES, 'UTF-8'),
        htmlspecialchars($ws['date'] ?? '', ENT_QUOTES, 'UTF-8'),
        $active,
        $missing,
        htmlspecialchars($manageUrl, ENT_QUOTES, 'UTF-8')
      );
    }
    $rowsHtml .= '</table>';

    $html = mailer_render('workshop_daily_report.php', [
      'advertiser_name' => $name,
      'report_rows' => $rowsHtml,
      'portal_url' => 'https://zeefe.com.br/anunciante-mobile.html'
    ]);
    if (mailer_send([['email' => $email, 'name' => $name]], 'Resumo diário dos workshops', $html)) {
      $sent++;
    }
  }

  echo json_encode(['success' => true, 'sent' => $sent]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

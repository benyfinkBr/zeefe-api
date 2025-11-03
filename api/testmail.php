<?php
require __DIR__ . '/lib/mailer.php';

try {
  $html = mailer_render('reservation_confirmed.php', [
    'cliente_nome' => 'Teste Bot',
    'sala_nome' => 'Sala Rouxinol',
    'data_formatada' => '10/11/2024',
    'hora_inicio' => '09:00',
    'hora_fim' => '11:00',
    'visitantes' => 'Visitante 1, Visitante 2',
    'link_portal' => 'https://zeefe.com.br/clientes.html',
    'bloco_informacoes' => '<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Efetue o pagamento em até 24h para garantir a sua reserva. Caso já tenha pago, desconsidere este aviso.</p>'
  ]);

  $enviado = mailer_send([
    ['email' => 'benyfink@gmail.com', 'name' => 'Teste Bot']
  ], 'Ze.EFE - Confirmação de reserva (teste)', $html);

  echo $enviado ? 'E-mail de teste enviado.' : 'Falha no envio.';
} catch (Throwable $e) {
  http_response_code(500);
  echo 'Erro: ' . $e->getMessage();
}

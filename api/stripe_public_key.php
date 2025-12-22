<?php
require 'apiconfig.php';

if (!$config || empty($config['stripe']['publishable_key'])) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => 'Stripe não configurado para uso no frontend.'
  ]);
  exit;
}

echo json_encode([
  'success' => true,
  'publishable_key' => $config['stripe']['publishable_key']
]);

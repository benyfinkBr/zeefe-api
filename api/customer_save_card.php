<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

http_response_code(503);
echo json_encode([
  'success' => false,
  'error' => 'Pagamentos e cartões estão temporariamente desativados.'
]);

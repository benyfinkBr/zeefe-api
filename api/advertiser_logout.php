<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

unset($_SESSION['advertiser_id'], $_SESSION['advertiser_name']);

echo json_encode(['success' => true]);

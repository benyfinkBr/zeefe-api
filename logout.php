<?php
require_once __DIR__ . '/includes/bootstrap.php';

// Clear session
$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}
session_destroy();

// Clear JS header session cookie used for back-compat hydration.
$host = $_SERVER['HTTP_HOST'] ?? '';
$headerCookieOptions = [
    'expires' => time() - 3600,
    'path' => '/',
    'secure' => $secure,
    'httponly' => false,
    'samesite' => 'Lax',
];
setcookie('ZEEFE_HEADER_SESSION', '', $headerCookieOptions);
if ($host && substr($host, -10) === 'zeefe.com.br') {
    $headerCookieOptions['domain'] = '.zeefe.com.br';
    setcookie('ZEEFE_HEADER_SESSION', '', $headerCookieOptions);
}

header('Location: /index.php');
exit;

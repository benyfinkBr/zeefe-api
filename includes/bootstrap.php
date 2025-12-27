<?php
// Session bootstrap for Ze.EFE
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '.zeefe.com.br',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// Optional debug
if (!empty($_GET['debug_session'])) {
    error_log('[SESSION DEBUG] status=' . session_status());
    error_log('[SESSION DEBUG] name=' . session_name());
    error_log('[SESSION DEBUG] id=' . session_id());
    $cookieVal = $_COOKIE[session_name()] ?? '(none)';
    error_log('[SESSION DEBUG] cookie=' . $cookieVal);
    error_log('[SESSION DEBUG] auth=' . json_encode($_SESSION['auth'] ?? null));
}

// Back-compat: hydrate from JS cookie if available
if (empty($_SESSION['auth']) && !empty($_COOKIE['ZEEFE_HEADER_SESSION'])) {
    $raw = urldecode($_COOKIE['ZEEFE_HEADER_SESSION']);
    $data = json_decode($raw, true);
    if (is_array($data) && !empty($data['name'])) {
        $_SESSION['auth'] = [
            'logged_in' => true,
            'user_id' => 0,
            'name' => $data['name'],
            'email' => $data['email'] ?? '',
            'role' => $data['type'] ?? 'client',
            'ts' => time(),
        ];
    }
}

function is_logged_in(): bool
{
    return !empty($_SESSION['auth']['logged_in']);
}

function current_user(): ?array
{
    return $_SESSION['auth'] ?? null;
}

function require_login(): void
{
    if (!is_logged_in()) {
        header('Location: /clientes.php');
        exit;
    }
}

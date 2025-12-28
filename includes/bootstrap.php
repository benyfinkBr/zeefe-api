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

// Back-compat: se já existe sessão de cliente/anunciante, mas ainda não há $_SESSION['auth'],
// cria um payload mínimo para o header server-side.
if (empty($_SESSION['auth'])) {
    if (!empty($_SESSION['client_id']) && !empty($_SESSION['client_name'])) {
        $_SESSION['auth'] = [
            'logged_in' => true,
            'user_id'   => (int)$_SESSION['client_id'],
            'name'      => $_SESSION['client_name'],
            'email'     => $_SESSION['client_email'] ?? '',
            'role'      => 'client',
            'ts'        => time(),
        ];
    } elseif (!empty($_SESSION['advertiser_id']) && !empty($_SESSION['advertiser_name'])) {
        $_SESSION['auth'] = [
            'logged_in' => true,
            'user_id'   => (int)$_SESSION['advertiser_id'],
            'name'      => $_SESSION['advertiser_name'],
            'email'     => $_SESSION['advertiser_email'] ?? '',
            'role'      => 'advertiser',
            'ts'        => time(),
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
        header('Location: /clientes.html');
        exit;
    }
}

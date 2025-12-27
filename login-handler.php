<?php
require_once __DIR__ . '/includes/bootstrap.php';

// Placeholder login handler: adjust credential validation as needed.
// Expecting POST: identifier, password, role (optional: 'client'|'advertiser')

$identifier = trim($_POST['identifier'] ?? '');
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? 'client';

// TODO: replace with real credential check against DB
if ($identifier && $password) {
    session_regenerate_id(true);
    $_SESSION['auth'] = [
        'logged_in' => true,
        'user_id' => 1,
        'name' => $identifier,
        'email' => $identifier,
        'role' => $role === 'advertiser' ? 'advertiser' : 'client',
        'ts' => time(),
    ];
    header('Location: ' . (($role === 'advertiser') ? '/anunciante.php' : '/clientes.php'));
    exit;
}

header('Location: /index.php');
exit;

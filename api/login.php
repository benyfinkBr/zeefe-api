<?php
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
  'lifetime' => 0,
  'path'     => '/',
  'domain'   => '',
  'secure'   => $secure,
  'httponly' => true,
  'samesite' => 'Lax'
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
  session_start();
  error_log('[SESSION] ID=' . session_id());
}

// Redireciona se já estiver logado
if (isset($_SESSION['user_id'])) {
  header('Location: zeefeadmin.html');
  exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $user = $_POST['username'] ?? '';
  $pass = $_POST['password'] ?? '';

  // Credenciais simples — pode trocar por consulta ao banco
  if ($user === 'admin' && $pass === '321') {
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = $user;
    header('Location: zeefeadmin.html');
    exit;
  } else {
    $error = 'Usuário ou senha incorretos.';
  }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login – Ze.EFE</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',system-ui,sans-serif; }
    body { background:linear-gradient(180deg,#F5F0E9 0%,#EDE7DF 100%); display:flex; align-items:center; justify-content:center; height:100vh; color:#1D413A; }
    .login-card { background:#FFF; border-radius:18px; padding:48px 56px; box-shadow:0 6px 24px rgba(0,0,0,.08); width:100%; max-width:380px; text-align:center; }
    .login-card img { width:140px; margin-bottom:28px; }
    .login-card h2 { font-weight:600; color:#1D413A; margin-bottom:28px; font-size:1.25rem; }
    .login-card input { width:100%; padding:10px 12px; margin:6px 0 16px; border:1px solid #CCC; border-radius:8px; font-size:14px; background:#F9F9F8; color:#1D413A; }
    .login-card button { width:100%; padding:12px 0; background:#1D413A; color:#F5F0E9; font-weight:600; border:none; border-radius:8px; cursor:pointer; font-size:15px; }
    .login-card button:hover { background:#16332E; }
    .error { color:#B00; margin-top:10px; font-size:14px; }
  </style>
</head>
<body>
  <div class="login-card">
    <img src="assets/logo-zeefe.svg" alt="Ze.EFE">
    <h2>Acesso ao Painel</h2>
    <form method="post">
      <input type="text" name="username" placeholder="Usuário" required>
      <input type="password" name="password" placeholder="Senha" required>
      <button type="submit">Entrar</button>
      <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>
    </form>
  </div>
</body>
</html>

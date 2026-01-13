<?php
$token = isset($_GET['token']) ? htmlspecialchars($_GET['token'], ENT_QUOTES, 'UTF-8') : '';
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Inventário — Autenticação</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .inventory-auth{max-width:520px;margin:60px auto;padding:28px;background:#fff;border-radius:18px;border:1px solid rgba(29,65,58,.08);box-shadow:var(--shadow-soft)}
    .inventory-auth h1{margin:0 0 10px;color:var(--brand-green)}
    .inventory-auth .form-row{margin-bottom:12px}
    .inventory-auth .form-row label{display:block;margin-bottom:6px}
    .inventory-auth .actions{display:flex;gap:12px;justify-content:flex-end;margin-top:16px}
  </style>
</head>
<body>
  <main class="inventory-auth">
    <h1>Inventário</h1>
    <p class="form-help">Faça login para acessar o item do patrimônio.</p>
    <?php if (!$token): ?>
      <div class="rooms-message">Token inválido. Verifique o QR Code.</div>
    <?php else: ?>
      <form id="inventoryAuthForm">
        <div class="form-row">
          <label for="inventoryUser">Usuário ou e-mail</label>
          <input type="text" id="inventoryUser" required>
        </div>
        <div class="form-row">
          <label for="inventoryPass">Senha</label>
          <input type="password" id="inventoryPass" required>
        </div>
        <div class="actions">
          <button type="submit" class="btn btn-primary">Entrar</button>
        </div>
        <div id="inventoryAuthMessage" class="rooms-message"></div>
      </form>
    <?php endif; ?>
  </main>

  <?php if ($token): ?>
  <script>
    const token = "<?php echo $token; ?>";
    const form = document.getElementById('inventoryAuthForm');
    const msg = document.getElementById('inventoryAuthMessage');
    const maybeRedirect = async () => {
      try {
        const res = await fetch(`/api/inventory_item.php?token=${encodeURIComponent(token)}`, { credentials: 'include' });
        if (res.ok) {
          window.location.href = `/inventario_item.php?token=${encodeURIComponent(token)}`;
        }
      } catch (_) {}
    };
    maybeRedirect();
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      msg.textContent = '';
      const username = document.getElementById('inventoryUser').value.trim();
      const password = document.getElementById('inventoryPass').value;
      if (!username || !password) return;
      try {
        const res = await fetch('/api/apilogin.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Falha no login');
        window.location.href = `/inventario_item.php?token=${encodeURIComponent(token)}`;
      } catch (err) {
        msg.textContent = err.message || 'Erro ao autenticar.';
      }
    });
  </script>
  <?php endif; ?>
</body>
</html>

<?php require_once __DIR__ . '/bootstrap.php'; ?>

<?php
$user = current_user();
$logged = !empty($user['logged_in']) && !empty($user['name']);
$role = $user['role'] ?? '';
?>
<header class="site-header">
  <div class="site-header-inner">
    <div class="site-header-left">
      <a href="/index.php" class="site-logo">
        <img src="/img/logo.jpg" alt="Ze.EFE" />
      </a>
      <nav class="site-nav">
        <a href="/salas.php">Salas</a>
        <a href="/workshops.php">Cursos</a>
        <a href="/conteudos.php">Conteúdos</a>
        <a href="/quemsomos.php">Quem somos</a>
      </nav>
    </div>
    <div class="site-header-actions">
      <a href="/index.php#contato" class="site-link">Contato</a>
      <div class="site-header-guest" data-zeefe-header="guest" <?php echo $logged ? 'hidden' : ''; ?>>
        <button class="btn btn-outline" type="button" data-zeefe-header-btn="login" onclick="window.location.href='/clientes.php'">Entrar</button>
      </div>
      <div class="site-header-user" data-zeefe-header="account" <?php echo $logged ? '' : 'hidden'; ?>>
        <button class="user-menu-trigger" type="button" data-zeefe-header-btn="account" aria-haspopup="true" aria-expanded="false">
          <span data-zeefe-header-label="account"><?php echo htmlspecialchars($logged ? ($user['name'] ?? 'Minha Conta') : 'Minha Conta'); ?></span>
        </button>
        <div class="user-menu-dropdown" role="menu">
          <p class="user-menu-label" data-zeefe-header-label="user">
            <?php echo htmlspecialchars($logged ? (($role === 'advertiser') ? 'Portal do Anunciante' : 'Portal do Cliente') : ''); ?>
          </p>
          <button type="button" class="user-menu-item" data-zeefe-header-btn="portal" onclick="window.location.href='<?php echo ($role === 'advertiser') ? '/anunciante.php' : '/clientes.php'; ?>'">Ir para o portal</button>
          <button type="button" class="user-menu-item user-menu-danger" data-zeefe-header-btn="logout" onclick="window.location.href='/logout.php'">Sair</button>
        </div>
      </div>
    </div>
  </div>
</header>

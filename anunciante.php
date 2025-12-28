<?php require __DIR__ . '/includes/bootstrap.php'; ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portal do Anunciante — Ze.EFE</title>
  <link rel="icon" href="/favicon.ico" />
  <link rel="stylesheet" href="/style.css?v=20241222" />
</head>
<body class="client-portal-page client-logged-out anunciante-page">
<?php require __DIR__ . '/includes/header.php'; ?>

<main class="client-portal">
  <!-- Auth overlay (portal do anunciante) -->
  <section id="authContainer" class="auth-container">
    <div class="auth-screen" id="authLogin">
      <div class="login-card">
        <img src="/img/logo.jpg" alt="Ze.EFE">
        <h2>Portal do Anunciante<br><span>Ze.EFE</span></h2>
        <form id="advLoginForm" autocomplete="on">
          <input type="text" id="advLoginIdentifier" placeholder="E‑mail ou CPF" required autocomplete="username" />
          <input type="password" id="advLoginPassword" placeholder="Senha" required autocomplete="current-password" />
          <label class="remember" style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="advRememberMe" /> Lembrar login neste computador
          </label>
          <button class="btn btn-primary" type="submit">Entrar</button>
        </form>
        <div id="advAuthMessage" class="rooms-message" style="margin-top:8px"></div>
        <div class="auth-quick-actions" style="margin-top:10px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button type="button" class="ghost-btn" id="advShowRecovery">Esqueci minha senha</button>
          <button type="button" class="ghost-btn" id="advShowRegister">Criar acesso</button>
        </div>
      </div>
    </div>
    <div class="auth-screen" id="advRegister" hidden>
      <div class="login-card register-card">
        <div class="register-hero">
          <img src="/img/logo.jpg" alt="Ze.EFE">
          <h2>Criar acesso<br><span>Portal do Anunciante</span></h2>
        </div>
        <form id="advRegisterForm" class="auth-form auth-form-grid" autocomplete="on">
          <div class="form-field">
            <label for="advRegName">Nome completo</label>
            <input type="text" id="advRegName" required />
          </div>
          <div class="form-field">
            <label for="advRegEmail">E‑mail</label>
            <input type="email" id="advRegEmail" required autocomplete="email" />
            <small class="input-hint">Use este e‑mail ou CPF para acessar o portal.</small>
          </div>
          <div class="form-field">
            <label for="advRegCpf">CPF</label>
            <input type="text" id="advRegCpf" maxlength="14" />
            <small class="input-hint">Opcional. Se preencher, use o mesmo CPF para login.</small>
            <div class="input-hint" id="advCpfHint"></div>
          </div>
          <div class="form-field">
            <label for="advRegPhone">Telefone</label>
            <input type="text" id="advRegPhone" />
          </div>
          <div class="form-field">
            <label for="advRegPublicName">Nome público (anúncio)</label>
            <input type="text" id="advRegPublicName" />
          </div>
          <div class="form-field">
            <label for="advRegPassword">Senha</label>
            <input type="password" id="advRegPassword" required />
            <div class="password-indicator" id="advPwStrength">Força da senha: aguardando</div>
          </div>
          <div class="form-field">
            <label for="advRegPasswordConfirm">Confirmar senha</label>
            <input type="password" id="advRegPasswordConfirm" required />
            <div class="password-indicator" id="advPwMatch">Confirmação: aguardando</div>
            <div class="input-hint" id="advPasswordHint">Mín. 8 caracteres, letras, números e símbolo.</div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Cadastrar</button>
            <button class="ghost-btn" type="button" id="advBackToLogin1">Voltar</button>
          </div>
          <div id="advRegisterMessage" class="rooms-message"></div>
        </form>
      </div>
    </div>
    <div class="auth-screen" id="advRecovery" hidden>
      <div class="login-card">
        <img src="/img/logo.jpg" alt="Ze.EFE">
        <h2>Recuperar acesso<br><span>Portal do Anunciante</span></h2>
        <form id="advRecoveryForm">
          <input type="email" id="advRecEmail" placeholder="Seu e‑mail" required />
          <button class="btn btn-primary" type="submit">Enviar</button>
        </form>
        <div id="advRecoveryMessage" class="rooms-message" style="margin-top:8px"></div>
        <button class="ghost-btn" type="button" id="advBackToLogin2" style="margin-top:12px">Voltar</button>
      </div>
    </div>
  </section>

  <section id="advPanels" hidden>
    <div class="portal-shell">
      <aside class="portal-nav">
        <div class="portal-nav-brand">
          <img src="/img/logo.jpg" alt="Ze.EFE">
          <div>
            <h2 id="advDisplay">Anunciante</h2>
            <p id="advOwner" class="portal-subtitle"></p>
          </div>
        </div>
        <div class="portal-nav-links">
          <button type="button" data-panel="overview" class="active">Visão Geral</button>
          <button type="button" data-panel="rooms">Minhas Salas</button>
          <button type="button" data-panel="workshops">Workshops</button>
          <button type="button" data-panel="reservations">Reservas</button>
          <button type="button" data-panel="finance">Financeiro</button>
          <button type="button" data-panel="messages" id="openAdvChatBtn">Mensagens</button>
          <button type="button" data-panel="reviews">Avaliações</button>
          <button type="button" data-panel="profile">Editar perfil</button>
        </div>
        <button class="nav-logout" id="advLogoutBtn" type="button">Sair</button>
      </aside>

      <div class="portal-main">
        <section class="portal-section" id="panel-overview">
          <h2>Portal do Anunciante</h2>
          <p>Gerencie suas salas, reservas e repasses</p>
          <div class="portal-summary-grid">
            <div class="summary-card">
              <div class="summary-card-title">Visualizações (30 dias)</div>
              <div class="summary-card-value" id="ovViews">—</div>
            </div>
            <div class="summary-card">
              <div class="summary-card-title">Reservas futuras</div>
              <div class="summary-card-value" id="ovUpcoming">0</div>
            </div>
            <div class="summary-card">
              <div class="summary-card-title">Saldo disponível</div>
              <div class="summary-card-value" id="ovBalance">R$ 0,00</div>
            </div>
          </div>
          <div class="panel-box" id="ovNext">
            <h3>Próximas reservas</h3>
            <div id="ovNextReservations" class="rooms-list"></div>
          </div>
          <div class="panel-actions">
            <button class="btn btn-secondary" id="advRefreshBtn" type="button">Atualizar</button>
          </div>
        </section>

        <section class="portal-section" id="panel-rooms" hidden>
          <div class="panel-header">
            <h2>Minhas Salas</h2>
            <button class="btn btn-primary" id="newRoomBtn" type="button">Nova sala</button>
          </div>
          <div id="roomsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-workshops" hidden>
          <div class="panel-header">
            <h2>Workshops</h2>
            <button class="btn btn-primary" id="advNewWorkshopBtn" type="button">Novo workshop</button>
          </div>
          <div id="advWorkshopsList" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-reservations" hidden>
          <h2>Reservas</h2>
          <div id="reservationsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-finance" hidden>
          <h2>Financeiro</h2>
          <div class="panel-box" id="finContainer"></div>
        </section>

        <section class="portal-section" id="panel-messages" hidden>
          <h2>Mensagens</h2>
          <div id="messagesContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-reviews" hidden>
          <h2>Avaliações</h2>
          <div id="reviewsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-profile" hidden>
          <h2>Dados do Anunciante</h2>
          <div class="panel-box">
            <p id="advProfileNameView" class="input-view"></p>
            <p id="advProfileEmailView" class="input-view"></p>
            <p id="advProfilePhoneView" class="input-view"></p>
            <p id="advProfileFeeView" class="input-view"></p>
            <div class="panel-actions">
              <button class="btn btn-secondary" id="advProfileOpenEditBtn" type="button">Editar Perfil</button>
              <button class="btn ghost-btn" id="advOpenPasswordModalBtn" type="button">Alterar senha</button>
            </div>
            <div id="advProfileViewMsg" class="rooms-message"></div>
          </div>
        </section>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="site-footer-inner">
    <div class="footer-column footer-map">
      <h3>Mapa do site</h3>
      <div class="footer-links-grid">
        <div>
          <h4>Salas</h4>
          <a href="/salas.php">Ver todas as salas</a>
        </div>
        <div>
          <h4>Cursos</h4>
          <a href="/workshops.php">Agenda de cursos e workshops</a>
        </div>
        <div>
          <h4>Área do Cliente</h4>
          <a href="/clientes.php">Reservas e visitantes</a>
        </div>
        <div>
          <h4>Anunciante</h4>
          <a href="/anunciante.php">Cadastrar salas e cursos</a>
        </div>
      </div>
    </div>
    <div class="footer-column footer-contact">
      <h3>Contato</h3>
      <p>contato@zeefe.com | (11) 9.6714-7377</p>
      <p>Moema, São Paulo - SP</p>
      <p><a href="#">Instagram</a> | <a href="#">LinkedIn</a></p>
    </div>
  </div>
  <div class="site-footer-bottom">
    <div class="footer-powered">
      <span>Powered by</span>
      <div class="footer-powered-logos">
        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%23005CAB'>HostGator</text></svg>" alt="HostGator" loading="lazy">
        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='130' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%2300317A'>Contabilizei</text></svg>" alt="Contabilizei" loading="lazy">
        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%23E10D5C'>cora</text></svg>" alt="Cora" loading="lazy">
      </div>
    </div>
    <p>© 2025 Ze.EFE - Todos os direitos reservados</p>
  </div>
</footer>

<script src="/scripts/header-session.js" defer></script>
<script src="/scripts/anunciante.js" defer></script>
</body>
</html>

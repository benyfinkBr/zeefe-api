<?php require __DIR__ . '/includes/bootstrap.php'; ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portal do Cliente — Ze.EFE</title>
  <link rel="stylesheet" href="/style.css?v=20241222" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</head>
<body class="client-portal-page client-logged-out">
<?php require __DIR__ . '/includes/header.php'; ?>

<main class="client-portal">
  <section id="authContainer" class="auth-container">
    <div id="authLogin" class="auth-screen">
      <div class="login-card">
        <img src="/img/logo.jpg" alt="Ze.EFE">
        <h2>Portal do Cliente<br><span>Ze.EFE</span></h2>
        <div class="scope-pill" style="display:flex; gap:8px; justify-content:center; margin:8px 0 12px;">
          <button type="button" id="authScopePFBtn" class="btn btn-secondary btn-sm active" data-scope="pf">Pessoa Física</button>
          <button type="button" id="authScopeCompanyBtn" class="btn btn-secondary btn-sm" data-scope="company">Empresa</button>
        </div>
        <form id="portalLoginForm" autocomplete="on">
          <input type="text" id="portalLoginIdentifier" name="identifier" placeholder="Login, e-mail ou CPF" required autocomplete="username" />
          <input type="password" id="portalLoginPassword" name="password" placeholder="Senha" required autocomplete="current-password" />
          <div class="remember-line">
            <label class="remember">
              <input type="checkbox" id="portalRememberMe" />
              <span>Lembrar login neste computador</span>
            </label>
          </div>
          <button class="btn btn-primary" type="submit">Entrar</button>
        </form>
        <div class="auth-quick-actions" id="authActions">
          <button type="button" class="ghost-btn" data-view="recovery">Esqueci minha senha</button>
          <button type="button" class="ghost-btn" data-view="register">Quero me cadastrar</button>
        </div>
        <div id="authMessage" class="rooms-message auth-message"></div>
      </div>
    </div>

    <div id="authRegister" class="auth-screen" hidden>
      <div class="login-card register-card">
        <div class="register-hero">
          <img src="/img/logo.jpg" alt="Ze.EFE">
          <h2>Criar acesso<br><span>Portal do Cliente</span></h2>
        </div>
        <form id="portalRegisterForm" class="auth-form auth-form-grid" autocomplete="on">
          <div class="form-field">
            <label for="registerName">Nome completo</label>
            <input type="text" id="registerName" name="name" required />
          </div>
          <div class="form-field">
            <label for="registerEmail">E-mail</label>
            <input type="email" id="registerEmail" name="email" required autocomplete="email" />
            <small class="input-hint">Use este e-mail ou CPF para acessar o portal.</small>
          </div>
          <div class="form-field">
            <label for="registerCpf">CPF</label>
            <input type="text" id="registerCpf" name="cpf" maxlength="14" required autocomplete="off" />
            <small class="input-hint" id="cpfHint">Informe os 11 dígitos do CPF.</small>
          </div>
          <div class="form-field">
            <label for="registerPhone">Telefone (opcional)</label>
            <input type="text" id="registerPhone" name="phone" maxlength="15" autocomplete="tel" />
          </div>
          <div class="form-field form-field-duo">
            <label for="registerPassword">Senha</label>
            <input type="password" id="registerPassword" name="password" required autocomplete="new-password" />
          </div>
          <div class="form-field form-field-duo">
            <label for="registerPasswordConfirm">Confirmar senha</label>
            <input type="password" id="registerPasswordConfirm" name="password_confirm" required autocomplete="new-password" />
          </div>
          <div class="form-field form-field-full password-indicators" id="passwordIndicators">
            <span class="password-indicator state-neutral" data-password-strength>Força da senha: aguardando</span>
            <span class="password-indicator state-neutral" data-password-match>Confirmação: aguardando</span>
          </div>
          <div class="form-field form-field-full">
            <p class="password-hint" id="passwordHint">
              A senha deve conter no mínimo 8 caracteres, incluindo letras, números e símbolos.
            </p>
          </div>
          <div class="form-field form-field-full">
            <button class="btn btn-primary" type="submit">Concluir cadastro</button>
          </div>
        </form>
        <button type="button" class="ghost-btn" data-view="login">Voltar ao login</button>
      </div>
    </div>

    <div id="authRecovery" class="auth-screen" hidden>
      <div class="login-card">
        <img src="/img/logo.jpg" alt="Ze.EFE">
        <h2>Recuperar senha<br><span>Portal do Cliente</span></h2>
        <form id="portalRecoveryForm">
          <input type="email" id="recoveryEmail" name="email" placeholder="Seu e-mail" required autocomplete="email" />
          <button class="btn btn-primary" type="submit">Enviar</button>
        </form>
        <div id="recoveryMessage" class="rooms-message" style="margin-top:10px"></div>
        <button type="button" class="ghost-btn" data-view="login" style="margin-top:12px">Voltar ao login</button>
      </div>
    </div>
  </section>

  <section id="clientPanels" hidden>
    <div class="portal-layout">
      <aside class="portal-sidebar">
        <div class="portal-profile">
          <div class="portal-avatar">Ze.EFE</div>
          <div class="portal-owner" id="portalDisplay">Cliente pessoa física</div>
          <div class="portal-owner-email" id="portalOwner"></div>
        </div>
        <div class="portal-nav">
          <div class="portal-nav-links">
            <button type="button" data-panel="book" class="active">Reservar</button>
            <button type="button" data-panel="reservations">Minhas Reservas</button>
            <button type="button" data-panel="visitors">Visitantes</button>
            <button type="button" data-panel="company">Empresa</button>
            <button type="button" data-panel="courses">Cursos</button>
            <button type="button" data-panel="profile">Meu Perfil</button>
          </div>
        </div>
        <button class="ghost-btn" id="portalLogoutBtn" type="button">Sair</button>
      </aside>

      <div class="portal-main">
        <section class="portal-section" id="panel-book">
          <h2>Reservar uma sala</h2>
          <p>Selecione um ou mais dias no calendário e depois escolha a sala.</p>
          <div id="calendarContainer" class="calendar-container"></div>
        </section>

        <section class="portal-section" id="panel-reservations" hidden>
          <h2>Minhas Reservas</h2>
          <div id="myReservations" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-visitors" hidden>
          <h2>Visitantes</h2>
          <div id="visitorsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-company" hidden>
          <h2>Empresa</h2>
          <div id="companyContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-courses" hidden>
          <h2>Cursos</h2>
          <div id="coursesContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-profile" hidden>
          <h2>Meu Perfil</h2>
          <div id="profileContainer" class="rooms-grid"></div>
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

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" defer></script>
<script src="https://js.stripe.com/v3/" defer></script>
<script src="/scripts/header-session.js" defer></script>
<script src="/scripts/clientes.js" defer></script>
</body>
</html>

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
          <button type="button" class="ghost-btn" id="advQuickRegisterBtn">Cadastro rápido</button>
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
          <button type="button" data-panel="messages" id="openAdvChatBtn">Mensagens <span id="advMessagesBadge" hidden>•</span></button>
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
            <button class="btn btn-primary" id="advNewRoomBtn" type="button">Nova sala</button>
          </div>
          <div id="advRoomsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-workshops" hidden>
          <div class="panel-header">
            <h2>Workshops</h2>
            <button class="btn btn-primary" id="advNewWorkshopBtn" type="button">Novo workshop</button>
          </div>
          <div id="advWorkshopsContainer" class="rooms-grid"></div>
          <h3 id="advEnrollmentsTitle">Inscrições recentes</h3>
          <div id="advEnrollmentsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-reservations" hidden>
          <h2>Reservas</h2>
          <div class="filters-wrap">
            <select id="advResStatusFilter" aria-label="Status">
              <option value="">Status (todos)</option>
              <option value="confirmada">Confirmada</option>
              <option value="pendente">Pendente</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <select id="advResPaymentFilter" aria-label="Pagamento">
              <option value="">Pagamento (todos)</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
            </select>
            <select id="advResOrder" aria-label="Ordenacao">
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigas</option>
            </select>
          </div>
          <div id="advReservationsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-finance" hidden>
          <h2>Financeiro</h2>
          <div class="panel-box">
            <div class="form-grid-mini">
              <div>
                <label for="advFinFrom">De</label>
                <input type="date" id="advFinFrom" />
              </div>
              <div>
                <label for="advFinTo">Até</label>
                <input type="date" id="advFinTo" />
              </div>
            </div>
            <div class="portal-actions">
              <button type="button" class="btn btn-secondary" id="advFinApply">Aplicar</button>
              <button type="button" class="btn btn-secondary" id="advFinExport">Exportar</button>
            </div>
            <div id="advFinanceContainer"></div>
          </div>
          <div class="panel-box">
            <h3>Dados de repasse</h3>
            <div class="form-grid-mini">
              <div>
                <label for="bankCode">Banco</label>
                <input type="text" id="bankCode" />
              </div>
              <div>
                <label for="bankName">Nome do banco</label>
                <input type="text" id="bankName" />
              </div>
            </div>
            <div class="form-grid-mini">
              <div>
                <label for="accountType">Tipo de conta</label>
                <input type="text" id="accountType" />
              </div>
              <div>
                <label for="agencyNumber">Agencia</label>
                <input type="text" id="agencyNumber" />
              </div>
            </div>
            <div class="form-grid-mini">
              <div>
                <label for="accountNumber">Conta</label>
                <input type="text" id="accountNumber" />
              </div>
              <div>
                <label for="pixKey">Chave Pix</label>
                <input type="text" id="pixKey" />
              </div>
            </div>
            <div class="portal-actions">
              <button type="button" class="btn btn-primary" id="savePayoutBtn">Salvar repasse</button>
            </div>
            <div id="payoutMessage" class="rooms-message"></div>
          </div>
        </section>

        <section class="portal-section" id="panel-messages" hidden>
          <h2>Mensagens</h2>
          <div id="advThreadsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-reviews" hidden>
          <h2>Avaliações</h2>
          <div id="advReviewsContainer" class="rooms-grid"></div>
        </section>

        <section class="portal-section" id="panel-profile" hidden>
          <h2>Dados do Anunciante</h2>
          <div class="panel-box">
            <p id="advProfileNameView" class="input-view"></p>
            <p id="advProfileEmailView" class="input-view"></p>
            <p id="advProfilePhoneView" class="input-view"></p>
            <p id="advProfileFeeView" class="input-view"></p>
            <div class="panel-actions">
              <button class="btn btn-secondary" id="advEditProfileBtn" type="button">Editar perfil</button>
              <button class="btn btn-secondary" id="advEditProfileSideBtn" type="button">Editar dados</button>
              <button class="btn btn-secondary" id="advProfileOpenEditBtn" type="button">Editar Perfil</button>
              <button class="btn btn-secondary" id="advProfileCancelViewBtn" type="button">Voltar</button>
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
          <a href="/salas.html">Ver todas as salas</a>
        </div>
        <div>
          <h4>Cursos</h4>
          <a href="/workshops.html">Agenda de cursos e workshops</a>
        </div>
        <div>
          <h4>Área do Cliente</h4>
          <a href="/clientes.html">Reservas e visitantes</a>
        </div>
        <div>
          <h4>Anunciante</h4>
          <a href="/anunciante.html">Cadastrar salas e cursos</a>
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

<div class="modal-overlay" id="advProfileModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="advProfileTitle">
    <button class="modal-close" type="button" id="advProfileClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="advProfileTitle">Editar perfil</h2>
        <form id="advProfileForm">
          <div class="form-field">
            <label for="advProfileDisplay">Nome publico</label>
            <input type="text" id="advProfileDisplay" />
          </div>
          <div class="form-field">
            <label for="advProfilePhone">Telefone</label>
            <input type="text" id="advProfilePhone" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" id="advProfileCancelBtn">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar</button>
          </div>
        </form>
        <div class="rooms-message" id="advProfileMsg"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="advPasswordModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="advPasswordTitle">
    <button class="modal-close" type="button" id="advPasswordClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="advPasswordTitle">Alterar senha</h2>
        <form id="advPasswordForm">
          <div class="form-field">
            <label for="advCurrentPassword">Senha atual</label>
            <input type="password" id="advCurrentPassword" required />
          </div>
          <div class="form-field">
            <label for="advNewPassword">Nova senha</label>
            <input type="password" id="advNewPassword" required />
            <div class="password-indicator" id="advPwdStrengthIndicator">Forca da senha: aguardando</div>
          </div>
          <div class="form-field">
            <label for="advNewPasswordConfirm">Confirmar nova senha</label>
            <input type="password" id="advNewPasswordConfirm" required />
            <div class="password-indicator" id="advPwdMatchIndicator">Confirmacao: aguardando</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" id="advPasswordCancel">Cancelar</button>
            <button class="btn btn-primary" type="submit">Atualizar senha</button>
          </div>
        </form>
        <div class="rooms-message" id="advPasswordMsg"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="advWorkshopModal" aria-hidden="true">
  <div class="modal-dialog wide" role="dialog" aria-modal="true" aria-labelledby="advWorkshopTitle">
    <button class="modal-close" type="button" id="advWorkshopClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="advWorkshopTitle">Workshop</h2>
        <form id="advWorkshopForm" class="auth-form auth-form-grid">
          <input type="hidden" id="advWorkshopId" />
          <input type="hidden" id="advWorkshopDatesJson" />
          <div class="form-field">
            <label for="advWorkshopTitleInput">Titulo</label>
            <input type="text" id="advWorkshopTitleInput" />
          </div>
          <div class="form-field">
            <label for="advWorkshopSubtitle">Subtitulo</label>
            <input type="text" id="advWorkshopSubtitle" />
          </div>
          <div class="form-field">
            <label for="advWorkshopRoom">Sala</label>
            <select id="advWorkshopRoom"></select>
          </div>
          <div class="form-field">
            <label for="advWorkshopCategory">Categoria</label>
            <select id="advWorkshopCategory">
              <option value="">Selecione</option>
              <option value="Desenvolvimento pessoal">Desenvolvimento pessoal</option>
              <option value="Saude e bem-estar">Saude e bem-estar</option>
              <option value="Psicologia / Terapia">Psicologia / Terapia</option>
              <option value="Negocios e carreira">Negocios e carreira</option>
              <option value="Tecnologia e inovacao">Tecnologia e inovacao</option>
              <option value="Financas e investimentos">Financas e investimentos</option>
              <option value="Arte e criatividade">Arte e criatividade</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div class="form-field">
            <label for="advWorkshopCategoryOther">Outra categoria</label>
            <input type="text" id="advWorkshopCategoryOther" />
          </div>
          <div class="form-field">
            <label>Datas</label>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <label><input type="radio" name="advWorkshopDateMode" id="advWorkshopDateSingle" checked /> Data unica</label>
              <label><input type="radio" name="advWorkshopDateMode" id="advWorkshopDateMulti" /> Datas multiplas</label>
            </div>
          </div>
          <div class="form-field" id="advWorkshopAddDateWrap">
            <label for="advWorkshopDate">Data</label>
            <div style="display:flex; gap:8px;">
              <input type="date" id="advWorkshopDate" />
              <button class="btn btn-secondary btn-sm" type="button" id="advWorkshopAddDateBtn">Adicionar data</button>
            </div>
          </div>
          <div class="form-field">
            <label for="advWorkshopEndDate">Data final</label>
            <input type="date" id="advWorkshopEndDate" />
          </div>
          <div class="form-field" id="advWorkshopTimeStartWrap">
            <label for="advWorkshopTimeStart">Horario inicio</label>
            <input type="time" id="advWorkshopTimeStart" />
          </div>
          <div class="form-field" id="advWorkshopTimeEndWrap">
            <label for="advWorkshopTimeEnd">Horario fim</label>
            <input type="time" id="advWorkshopTimeEnd" />
          </div>
          <div class="form-field">
            <label>Horario por lista</label>
            <div style="display:flex; gap:8px;">
              <select id="advWorkshopStartHour"></select>
              <select id="advWorkshopStartMinute"></select>
              <select id="advWorkshopEndHour"></select>
              <select id="advWorkshopEndMinute"></select>
            </div>
          </div>
          <div class="form-field">
            <label><input type="checkbox" id="advWorkshopSameTime" checked /> Manter o mesmo horario em todas as datas</label>
          </div>
          <div class="form-field form-field-full" id="advWorkshopDatesMultiWrap" hidden>
            <h4 class="modal-section-title">Datas adicionadas</h4>
            <div id="advWorkshopDatesList"></div>
            <div id="advWorkshopDatesSummary"></div>
          </div>
          <div class="form-field form-field-full" id="advWorkshopPerDayTimes" hidden></div>
          <div class="form-field">
            <label for="advWorkshopPrice">Preco</label>
            <input type="text" id="advWorkshopPrice" />
          </div>
          <div class="form-field">
            <label for="advWorkshopMinSeats">Minimo de vagas</label>
            <input type="number" id="advWorkshopMinSeats" />
          </div>
          <div class="form-field">
            <label for="advWorkshopMaxSeats">Maximo de vagas</label>
            <input type="number" id="advWorkshopMaxSeats" />
          </div>
          <div class="form-field">
            <label for="advWorkshopShowBar">Exibir no site</label>
            <select id="advWorkshopShowBar">
              <option value="1">Sim</option>
              <option value="0">Nao</option>
            </select>
          </div>
          <div class="form-field">
            <label for="advWorkshopStatus">Status</label>
            <select id="advWorkshopStatus">
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
              <option value="oculto">Oculto</option>
            </select>
          </div>
          <div class="form-field form-field-full">
            <label>Descricao</label>
            <div id="advWorkshopDescToolbar" class="modal-toolbar">
              <button type="button" data-tag="b">B</button>
              <button type="button" data-tag="i">I</button>
              <button type="button" data-tag="u">U</button>
              <button type="button" data-tag="br">Quebra</button>
            </div>
            <div id="advWorkshopDescriptionEditor" contenteditable="true" class="rich-editor"></div>
            <input type="hidden" id="advWorkshopDescription" />
          </div>
          <div class="form-field form-field-full">
            <label for="advWorkshopBanner">Banner</label>
            <input type="file" id="advWorkshopBanner" accept="image/*" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" id="advWorkshopCancelBtn">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar workshop</button>
          </div>
        </form>
        <div class="rooms-message" id="advWorkshopMsg"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay chat-drawer" id="advChatModal" aria-hidden="true">
  <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="advChatTitle">
    <button class="modal-close" type="button" id="advChatClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="chat-layout" id="advChatArea">
        <aside class="chat-sidebar">
          <div class="chat-sidebar-section">
            <h4 id="advChatTitle">Mensagens</h4>
          </div>
        </aside>
        <div class="chat-main">
          <div class="chat-header-line" id="advChatHeader"></div>
          <div class="chat-messages" id="advChatMessages"></div>
          <form id="advChatForm" class="chat-form">
            <input type="text" id="advChatInput" placeholder="Digite sua mensagem" />
            <button class="btn btn-primary" type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="advReservationModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="advReservationTitle">
    <button class="modal-close" type="button" id="advResClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="advReservationTitle">Reserva</h2>
        <div id="advResContent"></div>
        <div class="rooms-message" id="advResMessage"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" id="advResOpenChat">Abrir chat</button>
          <button class="btn btn-secondary" type="button" id="advResCancel">Cancelar reserva</button>
          <button class="btn btn-secondary" type="button" id="advResDeny">Recusar</button>
          <button class="btn btn-primary" type="button" id="advResConfirm">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="advRoomDetailsModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="advRoomDetTitle">
    <button class="modal-close" type="button" id="advRoomDetClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="advRoomDetTitle">Detalhes da sala</h2>
        <form id="advRoomDetailsForm">
          <input type="hidden" id="advRoomDetId" />
          <div class="form-field">
            <label for="advRoomDetName">Nome</label>
            <input type="text" id="advRoomDetName" />
          </div>
          <div class="form-field">
            <label for="advRoomDetRate">Valor diario</label>
            <input type="text" id="advRoomDetRate" />
          </div>
          <div class="form-field">
            <label for="advRoomDetStatus">Status</label>
            <input type="text" id="advRoomDetStatus" />
          </div>
          <div class="form-field">
            <label for="advRoomDetCityUf">Cidade/UF</label>
            <input type="text" id="advRoomDetCityUf" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" id="advRoomDetCancel">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar</button>
          </div>
        </form>
        <div class="rooms-message" id="advRoomDetMsg"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="advRoomModal" aria-hidden="true">
  <div class="modal-dialog wide" role="dialog" aria-modal="true" aria-labelledby="advRoomTitle">
    <button class="modal-close" type="button" id="advRoomClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="advRoomTitle">Sala</h2>
        <form id="advRoomForm" class="auth-form auth-form-grid">
          <input type="hidden" id="roomIdHidden" />
          <div class="form-field">
            <label for="roomName">Nome da sala</label>
            <input type="text" id="roomName" required />
          </div>
          <div class="form-field">
            <label for="roomCapacity">Capacidade</label>
            <input type="number" id="roomCapacity" />
          </div>
          <div class="form-field">
            <label for="roomCity">Cidade</label>
            <input type="text" id="roomCity" />
          </div>
          <div class="form-field">
            <label for="roomState">Estado (UF)</label>
            <input type="text" id="roomState" />
          </div>
          <div class="form-field">
            <label for="roomPrice">Valor diario</label>
            <input type="text" id="roomPrice" />
          </div>
          <div class="form-field">
            <label for="roomStatus">Status</label>
            <select id="roomStatus">
              <option value="ativo">Ativo</option>
              <option value="manutencao">Manutencao</option>
              <option value="desativada">Desativada</option>
            </select>
          </div>
          <div class="form-field form-field-full">
            <label for="roomDescription">Descricao</label>
            <textarea id="roomDescription" rows="4"></textarea>
          </div>
          <div class="form-field form-field-full">
            <label>Comodidades</label>
            <div id="advAmenitiesGrid" class="modal-amenities"></div>
          </div>
          <div class="form-field form-field-full">
            <label for="roomPhotos">Fotos</label>
            <input type="file" id="roomPhotos" multiple accept="image/*" />
            <div id="roomPhotosPreview"></div>
          </div>
          <div class="form-field">
            <label for="dailyRate">Valor diario (admin)</label>
            <input type="text" id="dailyRate" />
          </div>
          <div class="form-field">
            <label for="facilitatedAccess">Acesso facilitado</label>
            <input type="text" id="facilitatedAccess" />
          </div>
          <div class="form-field">
            <label for="portariaInteligente">Portaria inteligente</label>
            <input type="text" id="portariaInteligente" />
          </div>
          <div class="form-field">
            <label for="street">Rua</label>
            <input type="text" id="street" />
          </div>
          <div class="form-field">
            <label for="complement">Complemento</label>
            <input type="text" id="complement" />
          </div>
          <div class="form-field">
            <label for="cep">CEP</label>
            <input type="text" id="cep" />
          </div>
          <div class="form-field">
            <label for="responsavelNome">Responsavel</label>
            <input type="text" id="responsavelNome" />
          </div>
          <div class="form-field">
            <label for="responsavelTelefone">Telefone responsavel</label>
            <input type="text" id="responsavelTelefone" />
          </div>
          <div class="form-field">
            <label for="responsavelEmail">E-mail responsavel</label>
            <input type="email" id="responsavelEmail" />
          </div>
          <div class="form-field">
            <label for="portariaTelefone">Telefone portaria</label>
            <input type="text" id="portariaTelefone" />
          </div>
          <div class="form-field">
            <label for="portariaEmail">E-mail portaria</label>
            <input type="email" id="portariaEmail" />
          </div>
          <div class="form-field">
            <label for="locationInternal">Localizacao interna</label>
            <input type="text" id="locationInternal" />
          </div>
          <div class="form-field">
            <label for="maintenanceStart">Inicio manutencao</label>
            <input type="date" id="maintenanceStart" />
          </div>
          <div class="form-field">
            <label for="maintenanceEnd">Fim manutencao</label>
            <input type="date" id="maintenanceEnd" />
          </div>
          <div class="form-field">
            <label for="deactivatedFrom">Desativada a partir de</label>
            <input type="date" id="deactivatedFrom" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" id="advRoomCancel">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar sala</button>
          </div>
        </form>
        <div class="rooms-message" id="advRoomMessage"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="advStatusNoticeModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="advStatusNoticeTitle">
    <button class="modal-close" type="button" id="advStatusNoticeClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info">
        <h2 id="advStatusNoticeTitle">Atualizacao de status</h2>
        <p id="advStatusNoticeText"></p>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" id="advStatusNoticeReservations">Ver reservas</button>
          <button class="btn btn-primary" type="button" id="advStatusNoticeOk">Ok</button>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="/scripts/header-session.js" defer></script>
<script src="/scripts/anunciante.js?v=20250102" defer></script>
</body>
</html>

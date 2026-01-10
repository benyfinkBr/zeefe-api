<?php require __DIR__ . '/includes/bootstrap.php'; ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17483604386"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-17483604386');
</script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portal do Cliente — Ze.EFE</title>
  <link rel="stylesheet" href="/style.css?v=20241222" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</head>
<body class="client-portal-page auth-loading">
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
          <input type="text" id="recoveryLogin" name="login" placeholder="Login ou e-mail" />
          <input type="email" id="recoveryEmail" name="email" placeholder="Seu e-mail" required autocomplete="email" />
          <button class="btn btn-primary" type="submit">Enviar</button>
        </form>
        <div id="recoveryMessage" class="rooms-message" style="margin-top:10px"></div>
        <button type="button" class="ghost-btn" data-view="login" style="margin-top:12px">Voltar ao login</button>
      </div>
    </div>
  </section>

  <section id="clientPanels" hidden>
    <div class="portal-shell">
      <aside class="portal-nav">
        <div class="portal-nav-brand">
          <img src="/img/logo.jpg" alt="Ze.EFE">
          <div>
            <h2 id="clientName">Cliente</h2>
            <p id="clientCompany" class="portal-subtitle">Cliente pessoa física</p>
          </div>
        </div>
        <div class="portal-nav-links">
          <button type="button" data-panel="book" class="active">Reservar</button>
          <button type="button" data-panel="reservations">Minhas Reservas</button>
          <button type="button" data-panel="visitors">Visitantes</button>
          <button type="button" data-panel="company" id="companyTab">Empresa</button>
          <button type="button" data-panel="courses">Cursos</button>
          <button type="button" data-panel="profile">
            Meu Perfil <span id="clientMessagesBadge" hidden>•</span>
          </button>
        </div>
        <button type="button" class="referral-slot referral-slot-side" id="referralSlotSide" hidden>
          <span class="referral-kicker">Indique e Ganhe</span>
          <span class="referral-text">Quando você indica uma empresa para a Ze.EFE, vocês dois ganham.</span>
          <span class="referral-pill">Indicar agora</span>
        </button>
        <button class="nav-logout" id="logoutBtn" type="button">Sair</button>
      </aside>

      <div class="portal-main">
        <section class="portal-section" id="panel-book">
          <div class="portal-header">
            <div>
              <h2 id="bookingFormTitle">Reservar uma sala</h2>
              <p class="portal-subtitle" id="bookingModeHint">Buscar por Data: selecione um ou mais dias no calendário e depois escolha a sala.</p>
            </div>
            <div class="portal-actions">
              <button type="button" class="referral-slot referral-slot-top" id="referralSlotTop" hidden>Indique e Ganhe</button>
              <button type="button" class="btn btn-secondary" id="refreshBtn">Atualizar</button>
              <button type="button" class="btn btn-secondary" id="openSupportChatBtn">Mensagens</button>
              <button type="button" class="btn btn-secondary" id="clientSupportThreadItem">Falar com suporte</button>
            </div>
          </div>

          <div class="portal-actions" style="justify-content:flex-start;">
            <button type="button" class="btn btn-secondary btn-sm active" id="bookingModeDate">Buscar por data</button>
            <button type="button" class="btn btn-secondary btn-sm" id="bookingModeRoom">Buscar por sala</button>
            <button type="button" class="btn btn-secondary btn-sm" id="scopePFBtn">Pessoa física</button>
            <button type="button" class="btn btn-secondary btn-sm" id="scopeCompanyBtn">Empresa</button>
          </div>

          <form id="reservationBookForm" class="booking-card">
            <input type="hidden" name="id" />
            <input type="hidden" name="room_id" id="bookingRoomId" />
            <div class="booking-stepper">
              <div class="booking-stepper-item"><span>1</span><strong>Data</strong></div>
              <div class="booking-stepper-item"><span>2</span><strong>Sala</strong></div>
              <div class="booking-stepper-item"><span>3</span><strong>Detalhes</strong></div>
              <div class="booking-stepper-item"><span>4</span><strong>Visitantes</strong></div>
              <div class="booking-stepper-item"><span>5</span><strong>Resumo</strong></div>
            </div>

            <section class="booking-step">
              <div class="form-row">
                <label for="bookingDateInput">Data</label>
                <input type="date" id="bookingDateInput" />
              </div>
              <div class="form-row">
                <button type="button" class="btn btn-secondary btn-sm" id="dateModeSingle">Data única</button>
                <button type="button" class="btn btn-secondary btn-sm" id="dateModeMulti">Datas múltiplas</button>
                <span id="multiDateSummary"></span>
              </div>
              <div class="booking-calendar">
                <div class="calendar-header">
                  <button type="button" id="bookingPrevMonth" aria-label="Mês anterior">&lsaquo;</button>
                  <strong id="bookingCalendarLabel"></strong>
                  <button type="button" id="bookingNextMonth" aria-label="Próximo mês">&rsaquo;</button>
                </div>
                <div id="bookingCalendarGrid" class="calendar-grid"></div>
                <div class="calendar-legend">
                  <span><span class="calendar-dot available"></span>Disponível</span>
                  <span><span class="calendar-dot partial"></span>Parcial</span>
                  <span><span class="calendar-dot full"></span>Lotado</span>
                  <span><span class="calendar-dot selected"></span>Selecionado</span>
                </div>
              </div>
            </section>

            <section class="booking-step" hidden>
              <div id="bookingRoomFeedback" class="rooms-message"></div>
              <div id="bookingRoomOptions" class="rooms-grid"></div>
              <div id="bookingRoomsMap" class="rooms-map"></div>
            </section>

            <section class="booking-step" hidden>
              <div class="form-row">
                <label for="bookingTitle">Título da reserva</label>
                <input type="text" id="bookingTitle" name="title" required />
              </div>
              <div class="form-row">
                <label for="bookingDescription">Descrição</label>
                <textarea id="bookingDescription" name="description" rows="4"></textarea>
              </div>
              <div class="form-grid-mini">
                <div>
                  <label for="bookingTimeStart">Horário de início</label>
                  <input type="time" id="bookingTimeStart" name="time_start" />
                </div>
                <div>
                  <label for="bookingTimeEnd">Horário de fim</label>
                  <input type="time" id="bookingTimeEnd" name="time_end" />
                </div>
              </div>
              <div class="form-row" id="companyBookingRow">
                <label>
                  <input type="checkbox" id="bookingCompanyToggle" />
                  Reservar pela empresa
                </label>
              </div>
              <div class="form-row">
                <label for="bookingVoucherCode">Voucher</label>
                <div style="display:flex; gap:8px;">
                  <input type="text" id="bookingVoucherCode" />
                  <button type="button" class="btn btn-secondary btn-sm" id="bookingVoucherApply">Aplicar</button>
                </div>
                <small id="bookingVoucherResult"></small>
              </div>
            </section>

            <section class="booking-step" hidden>
              <div id="bookingVisitorSelector"></div>
              <div class="form-row">
                <label>
                  <input type="checkbox" name="send_invites" value="1" checked />
                  Enviar convites por e-mail
                </label>
              </div>
              <div class="form-row">
                <button type="button" class="btn btn-secondary btn-sm" id="openVisitorsPanel">Gerenciar visitantes</button>
              </div>
            </section>

            <section class="booking-step" hidden>
              <div id="bookingSummary"></div>
            </section>

            <div class="portal-actions">
              <button type="button" class="btn btn-secondary" id="bookingPrevBtn">Voltar</button>
              <button type="button" class="btn btn-secondary" id="bookingNextBtn">Avançar</button>
              <button type="submit" class="btn btn-primary" id="bookingSubmitBtn">Confirmar reserva</button>
              <button type="button" class="btn btn-secondary" id="cancelReservationEdit">Cancelar</button>
            </div>
            <div id="bookingMessage" class="rooms-message"></div>
          </form>
        </section>

        <section class="portal-section" id="panel-reservations" hidden>
          <div class="panel-header">
            <h2>Minhas Reservas</h2>
            <button type="button" class="btn btn-secondary" id="newReservationBtn">Nova reserva</button>
          </div>
          <div class="reservations-calendar-card">
            <div class="calendar-header">
              <button type="button" class="btn btn-secondary btn-sm" id="reservationsCalPrev" aria-label="Mês anterior">◀</button>
              <div class="calendar-label" id="reservationsCalLabel"></div>
              <button type="button" class="btn btn-secondary btn-sm" id="reservationsCalNext" aria-label="Próximo mês">▶</button>
            </div>
            <div class="calendar-grid" id="reservationsCalGrid"></div>
          </div>
          <div class="reservations-day-list" id="reservationsDayList">
            <div class="day-list-header">
              <div class="day-list-title" id="reservationsDayTitle">Selecione um dia no calendário</div>
              <button type="button" class="btn btn-secondary btn-sm" id="reservationsDayClear" hidden>Limpar filtro</button>
            </div>
            <div class="day-list-items" id="reservationsDayItems"></div>
          </div>
          <div id="reservationsContainer"></div>
        </section>

        <section class="portal-section" id="panel-visitors" hidden>
          <div class="panel-header">
            <h2>Visitantes</h2>
            <button type="button" class="btn btn-primary" id="newVisitorBtn">Novo visitante</button>
          </div>
          <div id="visitorFormWrapper" hidden>
            <h3 id="visitorFormTitle">Novo Visitante</h3>
            <form id="visitorForm" class="auth-form auth-form-grid">
              <input type="hidden" name="id" />
              <div class="form-field">
                <label>Nome</label>
                <input type="text" name="name" required />
              </div>
              <div class="form-field">
                <label>CPF</label>
                <input type="text" name="cpf" />
              </div>
              <div class="form-field">
                <label>RG</label>
                <input type="text" name="rg" />
              </div>
              <div class="form-field">
                <label>E-mail</label>
                <input type="email" name="email" />
              </div>
              <div class="form-field">
                <label>Telefone</label>
                <input type="text" name="phone" />
              </div>
              <div class="form-field">
                <label>WhatsApp</label>
                <input type="text" name="whatsapp" />
              </div>
              <div class="form-field">
                <label>Status</label>
                <select name="status">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div class="form-field form-field-full">
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="cancelVisitorEdit">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Salvar visitante</button>
                </div>
              </div>
            </form>
          </div>
          <div id="visitorsContainer"></div>
        </section>

        <section class="portal-section" id="panel-company" hidden>
          <div class="company-pending-card" id="companyPendingBlock" hidden>
            <h4>Convite pendente</h4>
            <p class="rooms-message">Você recebeu um convite para participar de uma empresa na Ze.EFE. Aceite para liberar os recursos empresariais.</p>
            <div id="companyPendingList" class="inbox-list"></div>
            <div id="companyPendingMessage" class="rooms-message"></div>
          </div>

          <div id="companyContent">
            <div class="panel-header">
              <h2>Empresa</h2>
              <div class="portal-actions">
                <button type="button" class="btn btn-secondary btn-sm" id="openInviteModal">Convidar membro</button>
                <button type="button" class="btn btn-secondary btn-sm" id="openManualModal">Adicionar manualmente</button>
                <button type="button" class="btn btn-secondary btn-sm" id="openImportModal">Importar</button>
              </div>
            </div>

            <div class="portal-actions">
              <button type="button" class="btn btn-secondary btn-sm company-tab active" data-company-tab="overview">Visão geral</button>
              <button type="button" class="btn btn-secondary btn-sm company-tab" data-company-tab="users">Usuários</button>
              <button type="button" class="btn btn-secondary btn-sm company-tab" data-company-tab="reservations">Reservas</button>
              <button type="button" class="btn btn-secondary btn-sm company-tab" data-company-tab="finance">Financeiro</button>
            </div>

            <div id="companyTab-overview">
              <div class="panel-box">
                <h3>Resumo</h3>
                <div class="quick-actions">
                  <button type="button" class="btn btn-secondary btn-sm" data-panel="reservations">Ver reservas</button>
                  <button type="button" class="btn btn-secondary btn-sm" data-panel="finance">Ver financeiro</button>
                </div>
                <div id="companyOverviewNext"></div>
              </div>
            </div>

            <div id="companyTab-users" hidden>
              <div class="panel-box">
                <h3>Usuários da empresa</h3>
                <div id="companyUsersContainer"></div>
              </div>
              <div class="panel-box">
                <h3>Convidar usuário</h3>
                <div class="form-grid-mini">
                  <div>
                    <label for="companyInviteCpf">CPF</label>
                    <input type="text" id="companyInviteCpf" />
                  </div>
                  <div>
                    <label for="companyInviteEmail">E-mail</label>
                    <input type="email" id="companyInviteEmail" />
                  </div>
                </div>
                <div class="form-grid-mini">
                  <div>
                    <label for="companyInviteRole">Perfil</label>
                    <select id="companyInviteRole">
                      <option value="membro">Membro</option>
                      <option value="gestor">Gestor</option>
                      <option value="leitor">Leitor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div style="display:flex; gap:8px; align-items:flex-end;">
                    <button type="button" class="btn btn-primary" id="companyInviteBtn">Enviar convite</button>
                    <button type="button" class="btn btn-secondary" id="companyResendBtn">Reenviar</button>
                  </div>
                </div>
                <div class="portal-actions">
                  <button type="button" class="btn btn-secondary btn-sm" id="companyManualBtn">Adicionar manualmente</button>
                  <button type="button" class="btn btn-secondary btn-sm" id="importPickFile">Importar XLSX</button>
                  <input type="file" id="companyCsvInput" accept=".csv" hidden />
                  <input type="file" id="companyXlsxInput" accept=".xlsx" hidden />
                </div>
              </div>

              <div class="panel-box" id="companyInvitesBlock">
                <div class="panel-header">
                  <h3>Convites enviados</h3>
                  <button type="button" class="btn btn-secondary btn-sm" id="companyInvitesClose">Fechar</button>
                </div>
                <div id="companyInvitesContainer"></div>
                <div class="portal-actions">
                  <button type="button" class="btn btn-secondary btn-sm" id="openManageInvites">Gerenciar convites</button>
                </div>
              </div>
            </div>

            <div id="companyTab-reservations" hidden>
              <div class="panel-box">
                <h3>Reservas da empresa</h3>
                <div id="companyReservationsContainer"></div>
              </div>
            </div>

            <div id="companyTab-finance" hidden>
              <div class="panel-box">
                <h3>Financeiro</h3>
                <div class="form-grid-mini">
                  <div>
                    <label for="finFrom">De</label>
                    <input type="date" id="finFrom" />
                  </div>
                  <div>
                    <label for="finTo">Até</label>
                    <input type="date" id="finTo" />
                  </div>
                </div>
                <div class="portal-actions">
                  <button type="button" class="btn btn-secondary" id="finApply">Aplicar</button>
                  <button type="button" class="btn btn-secondary" id="finExport">Exportar</button>
                </div>
                <div id="companyFinanceContainer"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="portal-section" id="panel-courses" hidden>
          <div class="panel-header">
            <h2>Cursos e Workshops</h2>
          </div>
          <div class="panel-box">
            <h3>Próximos cursos</h3>
            <div id="availableCoursesMessage" class="rooms-message"></div>
            <div id="availableCoursesGrid" class="rooms-grid"></div>
          </div>
          <div class="panel-box">
            <h3>Minhas inscrições</h3>
            <div id="clientCoursesMessage" class="rooms-message"></div>
            <div id="clientCoursesList" class="rooms-grid"></div>
            <div id="coursesFeedback" class="rooms-message"></div>
          </div>
        </section>

        <section class="portal-section" id="panel-profile" hidden>
          <div class="panel-header">
            <h2>Meu Perfil</h2>
            <div class="portal-actions">
              <button type="button" class="btn btn-secondary" id="editProfileBtn">Editar</button>
              <button type="button" class="btn btn-secondary" id="cancelProfileEditBtn" hidden>Cancelar</button>
              <button type="button" class="btn btn-secondary" id="openPasswordModalBtn">Alterar senha</button>
            </div>
          </div>
          <form id="profileForm" class="auth-form auth-form-grid">
            <input type="hidden" id="clientId" />
            <div class="form-field">
              <label for="profileNameInput">Nome</label>
              <input type="text" id="profileNameInput" />
            </div>
            <div class="form-field">
              <label for="profileLoginInput">Login</label>
              <input type="text" id="profileLoginInput" />
            </div>
            <div class="form-field">
              <label for="profileEmailInput">E-mail</label>
              <input type="email" id="profileEmailInput" />
            </div>
            <div class="form-field">
              <label for="profileCpfInput">CPF</label>
              <input type="text" id="profileCpfInput" />
            </div>
            <div class="form-field">
              <label for="profilePhoneInput">Telefone</label>
              <input type="text" id="profilePhoneInput" />
            </div>
            <div class="form-field">
              <label for="profileWhatsappInput">WhatsApp</label>
              <input type="text" id="profileWhatsappInput" />
            </div>
            <div class="form-field">
              <label for="profileCompanyInput">Empresa</label>
              <input type="text" id="profileCompanyInput" />
            </div>
            <div class="form-field">
              <label for="profileZipInput">CEP</label>
              <input type="text" id="profileZipInput" />
            </div>
            <div class="form-field">
              <label for="profileStreetInput">Rua</label>
              <input type="text" id="profileStreetInput" />
            </div>
            <div class="form-field">
              <label for="profileNumberInput">Número</label>
              <input type="text" id="profileNumberInput" />
            </div>
            <div class="form-field">
              <label for="profileComplementInput">Complemento</label>
              <input type="text" id="profileComplementInput" />
            </div>
            <div class="form-field">
              <label for="profileCityInput">Cidade</label>
              <input type="text" id="profileCityInput" />
            </div>
            <div class="form-field">
              <label for="profileStateInput">Estado</label>
              <input type="text" id="profileStateInput" />
            </div>
            <div class="form-field">
              <label for="profileCountryInput">País</label>
              <input type="text" id="profileCountryInput" />
            </div>
            <div class="form-field form-field-full">
              <button type="submit" class="btn btn-primary" id="saveProfileBtn">Salvar alterações</button>
            </div>
          </form>
          <div id="profileMessage" class="rooms-message"></div>
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
      </div>
    </div>
    <div class="footer-column footer-contact">
      <h3>Contato</h3>
      <p>contato@zeefe.com | <a href="https://wa.me/11922293332?text=Olá,%20gostaria%20de%20mais%20informações.">(11) 9.2229-3332</a></p>
      <p>Moema, São Paulo - SP</p>
      <p><a href="https://www.instagram.com/zeefe_brasil/">Instagram</a> | <a href="https://www.linkedin.com/company/zeefe/about/?viewAsMember=true">LinkedIn</a></p>
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

<div class="modal-overlay" id="courseDetailsModal" aria-hidden="true">
  <div class="modal-dialog wide" role="dialog" aria-modal="true" aria-labelledby="courseDetailsTitle">
    <button class="modal-close" type="button" id="courseDetailsClose" aria-label="Fechar">&times;</button>
    <div class="modal-body course-modal-body">
      <div class="modal-gallery" id="courseDetailsCoverWrapper" hidden>
        <img id="courseDetailsCover" alt="Banner do curso" loading="lazy">
      </div>
      <div class="modal-info">
        <h2 id="courseDetailsTitle">Curso</h2>
        <p class="modal-intro" id="courseDetailsMeta"></p>
        <div id="courseDetailsDescription"></div>
        <div class="modal-details">
          <p id="courseDetailsWhen"></p>
          <p id="courseDetailsWhere"></p>
          <p id="courseDetailsPrice"></p>
          <p id="courseDetailsSeats"></p>
        </div>
        <p id="courseDetailsStatus" class="modal-intro"></p>
        <div id="courseDetailsActions"></div>
        <button type="button" class="btn btn-secondary btn-sm" id="courseCheckoutOpen" hidden>Abrir checkout de pagamento</button>
        <div id="courseEnrollArea">
          <div class="form-row">
            <label for="courseDetailsVoucher">Voucher</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="courseDetailsVoucher" placeholder="Digite o codigo" />
              <button type="button" class="btn btn-secondary btn-sm" id="courseDetailsVoucherApply">Aplicar</button>
            </div>
            <small id="courseDetailsVoucherResult"></small>
          </div>
          <button type="button" class="btn btn-primary" id="courseDetailsConfirm">Confirmar inscricao</button>
        </div>
        <div id="courseTicketSection" hidden>
          <p id="courseTicketCode"></p>
          <div id="courseTicketQr"></div>
          <p id="courseTicketInfo"></p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="emailVerifyModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="emailVerifyTitle">
    <button class="modal-close" type="button" id="emailVerifyClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info">
        <h2 id="emailVerifyTitle">Verifique seu e-mail</h2>
        <p id="emailVerifyMessage"></p>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" id="emailVerifyResend">Reenviar link</button>
          <button class="btn btn-primary" type="button" id="emailVerifyDismiss">Entendi</button>
        </div>
        <div class="rooms-message" id="emailVerifyFeedback"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="reservationActionsModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="reservationActionsTitle">
    <button class="modal-close" type="button" id="reservationActionsClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info">
        <h2 id="reservationActionsTitle">Acoes da reserva</h2>
        <p id="reservationActionsMeta"></p>
        <div id="reservationActionsButtons"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="bookingVisitorsModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="bookingVisitorsTitle">
    <button class="modal-close" type="button" id="bookingVisitorsClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info">
        <h2 id="bookingVisitorsTitle">Visitantes</h2>
        <p id="bookingVisitorsMessage"></p>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" id="bookingVisitorsAddBtn">Adicionar visitantes</button>
          <button class="btn btn-primary" type="button" id="bookingVisitorsContinueBtn">Continuar</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="profileEditModal" aria-hidden="true">
  <div class="modal-dialog wide" role="dialog" aria-modal="true" aria-labelledby="profileEditTitle">
    <button class="modal-close" type="button" id="profileEditClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="profileEditTitle">Editar perfil</h2>
        <form id="profileEditForm" class="auth-form auth-form-grid">
          <div class="form-field">
            <label for="editName">Nome completo</label>
            <input type="text" id="editName" required />
          </div>
          <div class="form-field">
            <label for="editLogin">Login</label>
            <input type="text" id="editLogin" required />
          </div>
          <div class="form-field">
            <label for="editEmail">E-mail</label>
            <input type="email" id="editEmail" required />
          </div>
          <div class="form-field">
            <label for="editCpf">CPF</label>
            <input type="text" id="editCpf" />
          </div>
          <div class="form-field">
            <label for="editPhone">Telefone</label>
            <input type="text" id="editPhone" />
          </div>
          <div class="form-field">
            <label for="editWhatsapp">WhatsApp</label>
            <input type="text" id="editWhatsapp" />
          </div>
          <div class="form-field">
            <label for="editZip">CEP</label>
            <input type="text" id="editZip" />
          </div>
          <div class="form-field">
            <label for="editStreet">Rua</label>
            <input type="text" id="editStreet" />
          </div>
          <div class="form-field">
            <label for="editNumber">Numero</label>
            <input type="text" id="editNumber" />
          </div>
          <div class="form-field">
            <label for="editComplement">Complemento</label>
            <input type="text" id="editComplement" />
          </div>
          <div class="form-field">
            <label for="editCity">Cidade</label>
            <input type="text" id="editCity" />
          </div>
          <div class="form-field">
            <label for="editState">Estado</label>
            <input type="text" id="editState" />
          </div>
          <div class="form-field">
            <label for="editCountry">Pais</label>
            <input type="text" id="editCountry" />
          </div>
          <div class="form-field form-field-full">
            <div class="modal-footer">
              <button class="btn btn-secondary" type="button" id="profileEditCancel">Cancelar</button>
              <button class="btn btn-primary" type="submit">Salvar</button>
            </div>
          </div>
        </form>
        <div class="rooms-message" id="profileEditMessage"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="passwordChangeModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="passwordChangeTitle">
    <button class="modal-close" type="button" id="passwordChangeClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="passwordChangeTitle">Alterar senha</h2>
        <form id="passwordChangeForm" class="auth-form">
          <div class="form-field">
            <label for="currentPassword">Senha atual</label>
            <input type="password" id="currentPassword" required />
          </div>
          <div class="form-field">
            <label for="newPassword">Nova senha</label>
            <input type="password" id="newPassword" required />
            <div class="password-indicator" id="pwdStrengthIndicator">Forca da senha: aguardando</div>
          </div>
          <div class="form-field">
            <label for="newPasswordConfirm">Confirmar nova senha</label>
            <input type="password" id="newPasswordConfirm" required />
            <div class="password-indicator" id="pwdMatchIndicator">Confirmacao: aguardando</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" id="passwordChangeCancel">Cancelar</button>
            <button class="btn btn-primary" type="submit">Atualizar senha</button>
          </div>
        </form>
        <div class="rooms-message" id="passwordChangeMessage"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay chat-drawer" id="clientChatModal" aria-hidden="true">
  <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="clientChatTitle">
    <button class="modal-close" type="button" id="clientChatClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="chat-layout" id="clientChatArea">
        <aside class="chat-sidebar">
          <div class="chat-sidebar-section">
            <h4 id="clientChatTitle">Mensagens</h4>
          </div>
          <div id="clientChatThreadsList"></div>
          <div class="chat-report-row">
            <button type="button" class="btn btn-secondary btn-sm" id="openReportProblemBtn">Reportar problema</button>
          </div>
        </aside>
        <div class="chat-main">
          <div class="chat-header-line" id="clientChatHeader"></div>
          <div class="chat-messages" id="clientChatMessages"></div>
          <form id="clientChatForm" class="chat-form">
            <input type="text" id="clientChatInput" placeholder="Digite sua mensagem" />
            <button class="btn btn-primary" type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="referralModal" aria-hidden="true">
  <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="referralTitle">
    <button class="modal-close" type="button" id="referralClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info">
        <h2 id="referralTitle">Indique e Ganhe</h2>
        <p class="rooms-message">Preencha os dados abaixo para indicar uma empresa.</p>
        <div class="referral-info-card">
          <strong>Premiação por parceria</strong>
          <p>Se a empresa fechar parceria com a Ze.EFE, os prêmios podem variar conforme o volume de funcionários, chegando a até R$ 2.500 em dinheiro.</p>
        </div>
      </div>
      <form id="referralForm" class="referral-form">
        <div class="form-field">
          <label for="referralCompany">Qual empresa?</label>
          <input type="text" id="referralCompany" name="company" required />
        </div>
        <div class="form-field">
          <label for="referralContactName">Nome de pessoa responsável</label>
          <input type="text" id="referralContactName" name="contact_name" required />
        </div>
        <div class="form-field">
          <label for="referralContactPhone">Telefone da pessoa responsável</label>
          <input type="text" id="referralContactPhone" name="contact_phone" placeholder="(11) 9.1234-5678" required />
        </div>
        <div class="form-field">
          <label for="referralContactEmail">E-mail da pessoa responsável</label>
          <input type="email" id="referralContactEmail" name="contact_email" required pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" placeholder="nome@empresa.com.br" inputmode="email" />
        </div>
        <div class="form-field">
          <label for="referralReason">Porque você acha que a empresa usaria a plataforma da Ze.EFE?</label>
          <textarea id="referralReason" name="reason" rows="4" required></textarea>
          <p class="referral-disclaimer">Ao enviar, você aceita que seu nome seja compartilhado com a pessoa indicada.</p>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" id="referralCancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">Indicar</button>
        </div>
        <div id="referralMessage" class="rooms-message referral-message" hidden></div>
      </form>
    </div>
  </div>
</div>

<div class="modal-overlay" id="reportProblemModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="reportProblemTitle">
    <button class="modal-close" type="button" id="reportProblemClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="reportProblemTitle">Reportar problema</h2>
        <form id="reportProblemForm">
          <div class="form-field">
            <label for="reportIssueType">Tipo</label>
            <select id="reportIssueType" required>
              <option value="">Selecione</option>
              <option value="reserva">Reserva</option>
              <option value="pagamento">Pagamento</option>
              <option value="acesso">Acesso</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div class="form-field">
            <label for="reportIssueDescription">Descricao</label>
            <textarea id="reportIssueDescription" rows="4" required></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" id="reportProblemCancel">Cancelar</button>
            <button class="btn btn-primary" type="submit">Enviar</button>
          </div>
        </form>
        <div class="rooms-message" id="reportProblemMessage"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="inviteMemberModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="inviteMemberTitle">
    <button class="modal-close" type="button" id="inviteMemberClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="inviteMemberTitle">Convidar membro</h2>
        <div class="form-field">
          <label for="inviteCpf">CPF</label>
          <input type="text" id="inviteCpf" placeholder="000.000.000-00" />
        </div>
        <div class="form-field">
          <label for="inviteEmail">E-mail</label>
          <input type="email" id="inviteEmail" placeholder="email@exemplo.com" />
        </div>
        <div class="form-field">
          <label for="inviteRole">Perfil</label>
          <select id="inviteRole">
            <option value="membro">Membro</option>
            <option value="gestor">Gestor</option>
            <option value="leitor">Leitor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-row" style="display:flex; gap:8px; align-items:center;">
          <button class="btn btn-secondary btn-sm" type="button" id="inviteLookupBtn">Verificar cadastro</button>
          <span id="inviteLookupResult"></span>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" id="inviteMemberCancel">Cancelar</button>
          <button class="btn btn-primary" type="button" id="inviteMemberSend">Enviar convite</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="inviteInboxModal" aria-hidden="true">
  <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="inviteInboxTitle">
    <button class="modal-close" type="button" id="inviteInboxClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="padding:24px; width:100%">
        <h2 id="inviteInboxTitle" style="margin-top:0">Convites para empresas</h2>
        <p class="rooms-message">Você recebeu convites para participar de empresas. Aceite para ter acesso às funcionalidades de gestão.</p>
        <div id="inviteInboxList" class="inbox-list"></div>
        <div class="modal-actions" style="display:flex; gap:12px; justify-content:flex-end; margin-top:12px;">
          <button type="button" class="btn btn-secondary" id="inviteInboxDismiss">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="manualMembersModal" aria-hidden="true">
  <div class="modal-dialog wide" role="dialog" aria-modal="true" aria-labelledby="manualMembersTitle">
    <button class="modal-close" type="button" id="manualMembersClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="manualMembersTitle">Adicionar membros manualmente</h2>
        <div class="manual-table-wrap">
          <table class="manual-members-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>CPF</th>
                <th>Perfil</th>
              </tr>
            </thead>
            <tbody id="manualMembersTBody"></tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" id="manualAddRow">Adicionar linha</button>
          <button class="btn btn-secondary" type="button" id="manualMembersCancel">Cancelar</button>
          <button class="btn btn-primary" type="button" id="manualMembersSubmit">Enviar convites</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="importContactsModal" aria-hidden="true">
  <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="importContactsTitle">
    <button class="modal-close" type="button" id="importContactsClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info">
        <h2 id="importContactsTitle">Importar contatos</h2>
        <p>Use as opcoes de CSV/XLSX na area da empresa para carregar contatos em lote.</p>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="xlsxPreviewModal" aria-hidden="true">
  <div class="modal-dialog wide" role="dialog" aria-modal="true" aria-labelledby="xlsxPreviewTitle">
    <button class="modal-close" type="button" id="xlsxPreviewClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="xlsxPreviewTitle">Pre-visualizacao do XLSX</h2>
        <div id="xlsxPreviewTable"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" id="xlsxPreviewAdd">Adicionar linha</button>
          <button class="btn btn-secondary" type="button" id="xlsxPreviewCancel">Cancelar</button>
          <button class="btn btn-primary" type="button" id="xlsxPreviewConfirm">Importar selecionados</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay card-payment-modal" id="cardModal" aria-hidden="true">
  <div class="modal-dialog wide card-payment-modal" role="dialog" aria-modal="true" aria-labelledby="cardModalTitle">
    <button class="modal-close" type="button" id="cardModalClose" aria-label="Fechar">&times;</button>
    <div class="modal-body">
      <div class="modal-info" style="width:100%;">
        <h2 id="cardModalTitle">Salvar cartao</h2>
        <form id="cardSaveForm" class="card-payment-form">
          <input type="hidden" id="cardClientId" />
          <div class="form-field">
            <label for="cardHolderName">Nome impresso no cartao</label>
            <input type="text" id="cardHolderName" required />
          </div>
          <div class="form-field">
            <label>Dados do cartao</label>
            <div class="stripe-card-wrapper">
              <div id="stripeCardElement" class="StripeElement"></div>
            </div>
          </div>
          <div class="form-field billing-toggle-row">
            <label>
              <input type="checkbox" id="cardUseProfileData" checked />
              Usar dados do perfil
            </label>
          </div>
          <div id="cardBillingFields" class="billing-fields">
            <div class="form-field">
              <label for="cardBillingEmail">E-mail de cobranca</label>
              <input type="email" id="cardBillingEmail" />
            </div>
            <div class="form-field">
              <label for="cardBillingZip">CEP</label>
              <input type="text" id="cardBillingZip" />
            </div>
            <div class="form-field">
              <label for="cardBillingState">Estado</label>
              <input type="text" id="cardBillingState" />
            </div>
            <div class="form-field">
              <label for="cardBillingCity">Cidade</label>
              <input type="text" id="cardBillingCity" />
            </div>
            <div class="form-field">
              <label for="cardBillingCountry">Pais</label>
              <input type="text" id="cardBillingCountry" />
            </div>
            <div class="form-field">
              <label for="cardBillingStreet">Rua</label>
              <input type="text" id="cardBillingStreet" />
            </div>
            <div class="form-field">
              <label for="cardBillingNumber">Numero</label>
              <input type="text" id="cardBillingNumber" />
            </div>
            <div class="form-field">
              <label for="cardBillingComplement">Complemento</label>
              <input type="text" id="cardBillingComplement" />
            </div>
          </div>
          <div class="rooms-message" id="cardErrors" hidden></div>
          <div class="rooms-message" id="cardSaveMessage" hidden></div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" id="cardModalCancel">Cancelar</button>
            <button class="btn btn-primary" type="submit" id="cardSubmitBtn">Salvar cartao</button>
          </div>
        </form>
        <div id="cardListEmpty" class="rooms-message"></div>
        <div id="cardListError" class="rooms-message" hidden></div>
        <section id="cardListSection" hidden>
          <h3>Cartoes salvos</h3>
          <ul id="cardList" class="card-list"></ul>
        </section>
      </div>
    </div>
  </div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" defer></script>
<script src="https://js.stripe.com/v3/" defer></script>
<script src="/scripts/header-session.js" defer></script>
<script src="/scripts/clientes.js?v=20250102" defer></script>
</body>
</html>


document.addEventListener('DOMContentLoaded', () => {

  const mainTabs = document.querySelectorAll('.tabs:first-of-type .tab');
  const sections = { 
    login: document.getElementById('login'), 
    register: document.getElementById('register') 
  };

  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mainTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      Object.keys(sections).forEach(key => {
        sections[key].classList.toggle('active', key === target);
        sections[key].setAttribute('aria-hidden', key !== target);
      });
    });
  });

  const registerTabs = document.querySelectorAll('#register .tabs .tab');
  const forms = { 
    pf: document.getElementById('registerPF'), 
    pj: document.getElementById('registerPJ') 
  };

  registerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      registerTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      Object.keys(forms).forEach(key => {
        forms[key].style.display = key === target ? 'block' : 'none';
      });
    });
  });

  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const loginSuccess = document.getElementById('loginSuccess');

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    loginError.textContent = '';
    loginSuccess.textContent = '';

    const loginValue = loginForm.login.value.trim();
    const passwordValue = loginForm.password.value;

    if (!loginValue || !passwordValue) {
      loginError.textContent = 'Por favor, preencha todos os campos';
      return;
    }

    try {
      const response = await fetch('/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ login: loginValue, password: passwordValue })
      });

      const json = await response.json();
      if (json.success) {
        loginSuccess.textContent = 'Login realizado com sucesso! Redirecionando...';
        setTimeout(() => {
          window.location.href = '/clientes.php';
        }, 1500);
      } else {
        loginError.textContent = json.error || 'Erro no login';
      }
    } catch (err) {
      loginError.textContent = err.message || 'Erro na comunicação com o servidor';
    }
  });

  const registerPF = document.getElementById('registerPF');
  const pfRegisterError = document.getElementById('pfRegisterError');
  const pfRegisterSuccess = document.getElementById('pfRegisterSuccess');

  registerPF.addEventListener('submit', async e => {
    e.preventDefault();
    pfRegisterError.textContent = '';
    pfRegisterSuccess.textContent = '';

    if (!registerPF.checkValidity()) {
      pfRegisterError.textContent = 'Por favor, preencha corretamente todos os campos';
      return;
    }
    if (registerPF.pfPassword.value !== registerPF.pfConfirmPassword.value) {
      pfRegisterError.textContent = 'As senhas não coincidem';
      return;
    }

    const payload = {
      table: 'clients',
      record: {
        nome: registerPF.nome.value,
        email: registerPF.email.value,
        login: registerPF.login.value,
        senha_hash: registerPF.pfPassword.value,
        cpf: registerPF.cpf.value,
        rg: registerPF.rg.value,
        phone: registerPF.phone.value,
        whatsapp: registerPF.whatsapp.value,
        tipo: 'PF',
        status: 'ativo'
      }
    };

    try {
      const response = await fetch('/api/apisave.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (json.success) {
        pfRegisterSuccess.textContent = 'Conta criada com sucesso! Você já pode fazer login.';
        registerPF.reset();
      } else {
        pfRegisterError.textContent = json.error || 'Erro ao criar conta';
      }
    } catch (err) {
      pfRegisterError.textContent = err.message || 'Erro no servidor';
    }
  });

  const registerPJ = document.getElementById('registerPJ');
  const pjRegisterError = document.getElementById('pjRegisterError');
  const pjRegisterSuccess = document.getElementById('pjRegisterSuccess');

  registerPJ.addEventListener('submit', async e => {
    e.preventDefault();
    pjRegisterError.textContent = '';
    pjRegisterSuccess.textContent = '';

    if (!registerPJ.checkValidity()) {
      pjRegisterError.textContent = 'Por favor, preencha corretamente todos os campos';
      return;
    }
    if (registerPJ.pjMasterPassword.value !== registerPJ.pjMasterConfirmPassword.value) {
      pjRegisterError.textContent = 'As senhas não coincidem';
      return;
    }

    const companyPayload = {
      table: 'companies',
      record: {
        razao_social: registerPJ.razao_social.value,
        nome_fantasia: registerPJ.nome_fantasia.value || null,
        cnpj: registerPJ.cnpj.value,
        email: registerPJ.email.value,
        phone: registerPJ.phone.value,
        status: 'ativo'
      }
    };

    const userPayload = {
      table: 'clients',
      record: {
        nome: registerPJ.nome.value,
        email: registerPJ.user_email.value,
        login: registerPJ.login.value,
        senha_hash: registerPJ.pjMasterPassword.value,
        cpf: registerPJ.cpf.value,
        whatsapp: registerPJ.whatsapp.value,
        tipo: 'PJ',
        status: 'ativo'
      }
    };

    try {
      let response = await fetch('/api/apisave.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(companyPayload)
      });
      let json = await response.json();
      if (!json.success) {
        pjRegisterError.textContent = json.error || 'Erro ao criar empresa';
        return;
      }
      const companyId = json.insertId || null;
      if (!companyId) {
        pjRegisterError.textContent = 'Erro: ID da empresa não retornado';
        return;
      }

      userPayload.record.company_id = companyId;

      response = await fetch('/api/apisave.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(userPayload)
      });
      json = await response.json();
      if (!json.success) {
        pjRegisterError.textContent = json.error || 'Erro ao criar usuário master';
        return;
      }
      pjRegisterSuccess.textContent = 'Conta PJ criada com sucesso! Você pode fazer login.';
      registerPJ.reset();
    } catch (err) {
      pjRegisterError.textContent = err.message || 'Erro no servidor';
    }
  });

});

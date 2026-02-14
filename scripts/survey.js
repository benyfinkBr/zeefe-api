(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('t') || params.get('token') || '';
  const bodyEl = document.getElementById('surveyBody');
  const formEl = document.getElementById('surveyForm');
  const msgEl = document.getElementById('surveyMsg');

  let surveyQuestions = [];
  let surveyMeta = {};
  let rulesMap = {};
  let currentQuestionIndex = 0;
  let finalStepActive = false;
  let introStepActive = true;
  let progressWrapEl = null;
  const questionEls = new Map();

  function showMessage(text, isSuccess) {
    msgEl.textContent = text;
    msgEl.className = 'msg' + (isSuccess ? ' success' : '');
    msgEl.style.display = 'block';
  }

  function hideMessage() {
    msgEl.style.display = 'none';
  }

  function escapeHtml(v) {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderIntroStep() {
    bodyEl.className = 'intro';
    bodyEl.innerHTML = `
      <h1 class="title">${escapeHtml(surveyMeta.title || 'Questionário')}</h1>
      ${surveyMeta.description ? `<p class="desc">${escapeHtml(surveyMeta.description)}</p>` : ''}
      <div class="intro-actions">
        <button type="button" class="btn" id="surveyStartBtn">Começar questionário</button>
      </div>
    `;
    const startBtn = document.getElementById('surveyStartBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        introStepActive = false;
        bodyEl.style.display = 'none';
        formEl.style.display = 'block';
        renderCurrentQuestion();
      });
    }
  }

  function sanitizeQuestionHtml(value) {
    const template = document.createElement('template');
    template.innerHTML = String(value ?? '');
    const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'DIV', 'UL', 'OL', 'LI', 'A', 'IMG', 'SPAN']);
    const allowedAttrs = {
      A: new Set(['href', 'target', 'rel']),
      IMG: new Set(['src', 'alt', 'title']),
      SPAN: new Set([]),
      P: new Set([]),
      DIV: new Set([]),
      B: new Set([]),
      STRONG: new Set([]),
      I: new Set([]),
      EM: new Set([]),
      U: new Set([]),
      BR: new Set([]),
      UL: new Set([]),
      OL: new Set([]),
      LI: new Set([])
    };
    const cleanUrl = (url, allowDataImage = false) => {
      const raw = String(url || '').trim();
      if (!raw) return '';
      if (/^https?:\/\//i.test(raw)) return raw;
      if (/^mailto:/i.test(raw)) return raw;
      if (/^tel:/i.test(raw)) return raw;
      if (allowDataImage && /^data:image\//i.test(raw)) return raw;
      return '';
    };
    const cleanStyle = (styleValue) => {
      const safe = [];
      String(styleValue || '').split(';').forEach((chunk) => {
        const [rawName, rawValue] = chunk.split(':');
        if (!rawName || !rawValue) return;
        const name = rawName.trim().toLowerCase();
        const value = rawValue.trim().toLowerCase();
        if (name === 'font-size' && /^(\d+(?:\.\d+)?)(px|rem|em|%)$/.test(value)) {
          safe.push(`font-size:${value}`);
        } else if (name === 'line-height' && /^(\d+(?:\.\d+)?)(px|rem|em|%)?$/.test(value)) {
          safe.push(`line-height:${value}`);
        }
      });
      return safe.join('; ');
    };
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.tagName.toUpperCase();
          if (!allowedTags.has(tag)) {
            child.replaceWith(...Array.from(child.childNodes));
            return;
          }
          Array.from(child.attributes).forEach((attr) => {
            const attrName = attr.name.toLowerCase();
            const allowed = allowedAttrs[tag] || new Set();
            if (attrName === 'style') {
              const cleaned = cleanStyle(attr.value);
              if (cleaned) child.setAttribute('style', cleaned);
              else child.removeAttribute('style');
              return;
            }
            if (!allowed.has(attr.name) || attrName.startsWith('on')) {
              child.removeAttribute(attr.name);
              return;
            }
            if (tag === 'A' && attrName === 'href') {
              const clean = cleanUrl(attr.value, false);
              if (!clean) child.removeAttribute('href');
              else child.setAttribute('href', clean);
            }
            if (tag === 'A' && attrName === 'target') {
              if (child.getAttribute('target') !== '_blank') child.removeAttribute('target');
            }
            if (tag === 'A' && attrName === 'rel') {
              child.setAttribute('rel', 'noopener noreferrer');
            }
            if (tag === 'IMG' && attrName === 'src') {
              const clean = cleanUrl(attr.value, true);
              if (!clean) child.removeAttribute('src');
              else child.setAttribute('src', clean);
            }
          });
          if (tag === 'A' && child.getAttribute('target') === '_blank') {
            child.setAttribute('rel', 'noopener noreferrer');
          }
          walk(child);
        } else if (child.nodeType === Node.COMMENT_NODE) {
          child.remove();
        }
      });
    };
    walk(template.content);
    return template.innerHTML.trim();
  }

  function renderQuestion(q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'question';
    wrapper.dataset.questionId = q.id;
    wrapper.dataset.type = q.type;
    wrapper.dataset.required = q.required ? '1' : '0';

    const label = document.createElement('div');
    label.className = 'question-label';
    const rawQuestionHtml = String(q.question_text || 'Pergunta');
    const hasHtmlTag = /<[^>]+>/.test(rawQuestionHtml);
    const preparedHtml = hasHtmlTag ? rawQuestionHtml : rawQuestionHtml.replace(/\n/g, '<br>');
    label.innerHTML = sanitizeQuestionHtml(preparedHtml);
    if (q.required) {
      const req = document.createElement('span');
      req.className = 'required';
      req.textContent = '*';
      label.appendChild(req);
    }
    wrapper.appendChild(label);

    if (q.type === 'short_text') {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = `q_${q.id}`;
      wrapper.appendChild(input);
    } else if (q.type === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.name = `q_${q.id}`;
      if (q.number_min !== null && q.number_min !== undefined && q.number_min !== '') input.min = q.number_min;
      if (q.number_max !== null && q.number_max !== undefined && q.number_max !== '') input.max = q.number_max;
      wrapper.appendChild(input);
    } else if (q.type === 'scale') {
      const scale = document.createElement('div');
      scale.className = 'scale';
      const min = Number(q.scale_min || 1);
      const max = Number(q.scale_max || 5);
      for (let i = min; i <= max; i += 1) {
        const opt = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q_${q.id}`;
        radio.value = i;
        opt.appendChild(radio);
        opt.append(` ${i}`);
        scale.appendChild(opt);
      }
      wrapper.appendChild(scale);
    } else if (q.type === 'single_choice') {
      const list = document.createElement('div');
      list.className = 'options';
      (q.options || []).forEach(opt => {
        const row = document.createElement('label');
        row.className = 'option-item';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q_${q.id}`;
        radio.value = opt.id;
        row.appendChild(radio);
        row.append(` ${opt.label}`);
        list.appendChild(row);
      });
      wrapper.appendChild(list);
    } else if (q.type === 'multiple_choice') {
      const list = document.createElement('div');
      list.className = 'options';
      (q.options || []).forEach(opt => {
        const row = document.createElement('label');
        row.className = 'option-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = `q_${q.id}[]`;
        checkbox.value = opt.id;
        row.appendChild(checkbox);
        row.append(` ${opt.label}`);
        list.appendChild(row);
      });
      wrapper.appendChild(list);
    }

    return wrapper;
  }

  function getAnswerForQuestion(q) {
    const qid = q.id;
    if (q.type === 'short_text') {
      const input = formEl.querySelector(`input[name="q_${qid}"]`);
      const value = input ? input.value.trim() : '';
      if (!value) return null;
      return { question_id: qid, value };
    }
    if (q.type === 'number') {
      const input = formEl.querySelector(`input[name="q_${qid}"]`);
      const value = input ? input.value.trim() : '';
      if (value === '') return null;
      return { question_id: qid, value };
    }
    if (q.type === 'scale') {
      const selected = formEl.querySelector(`input[name="q_${qid}"]:checked`);
      if (!selected) return null;
      return { question_id: qid, value: selected.value };
    }
    if (q.type === 'single_choice') {
      const selected = formEl.querySelector(`input[name="q_${qid}"]:checked`);
      if (!selected) return null;
      return { question_id: qid, option_id: selected.value };
    }
    if (q.type === 'multiple_choice') {
      const selected = Array.from(formEl.querySelectorAll(`input[name="q_${qid}[]"]:checked`)).map(el => el.value);
      if (!selected.length) return null;
      return { question_id: qid, option_ids: selected };
    }
    return null;
  }

  function buildRulesMap(questions) {
    const map = {};
    questions.forEach(q => {
      const inner = {};
      (q.options || []).forEach(opt => {
        if (opt.branch_to || opt.branch_end) {
          inner[String(opt.id)] = {
            target: opt.branch_to ? Number(opt.branch_to) : null,
            end: Number(opt.branch_end || 0) === 1
          };
        }
      });
      map[q.id] = inner;
    });
    return map;
  }

  function getQuestionIndexById(questionId) {
    return surveyQuestions.findIndex(q => Number(q.id) === Number(questionId));
  }

  function getDefaultNextQuestionId(index) {
    const q = surveyQuestions[index];
    if (!q) return null;
    if (Number(q.end_if_no_branch || 0) === 1) return '__END__';
    const configured = Number(q.default_next_question_id || 0);
    if (configured > 0) return configured;
    const next = surveyQuestions[index + 1];
    return next ? Number(next.id) : '__END__';
  }

  function getNextQuestionIdByAnswer(index) {
    const q = surveyQuestions[index];
    if (!q) return null;

    const answer = getAnswerForQuestion(q);
    const branchRules = rulesMap[q.id] || {};

    if (answer && q.type === 'single_choice' && answer.option_id) {
      const rule = branchRules[String(answer.option_id)];
      if (rule?.end) return '__END__';
      if (rule?.target) return rule.target;
    }

    if (answer && q.type === 'multiple_choice' && Array.isArray(answer.option_ids)) {
      const orderedSelected = (q.options || [])
        .map(opt => String(opt.id))
        .filter(id => answer.option_ids.map(String).includes(id));
      const firstRule = orderedSelected
        .map(id => branchRules[id])
        .find(Boolean);
      if (firstRule?.end) return '__END__';
      if (firstRule?.target) return firstRule.target;
    }

    return getDefaultNextQuestionId(index);
  }

  function computePath() {
    const path = [];
    if (!surveyQuestions.length) return path;

    let index = 0;
    const visited = new Set();

    while (index >= 0 && index < surveyQuestions.length) {
      const q = surveyQuestions[index];
      if (!q) break;
      const qid = Number(q.id);
      if (visited.has(qid)) break;
      visited.add(qid);
      path.push(qid);

      const nextId = getNextQuestionIdByAnswer(index);
      if (!nextId || nextId === '__END__') break;
      index = getQuestionIndexById(nextId);
      if (index < 0) break;
    }

    return path;
  }

  function isQuestionAnswered(q) {
    return !!getAnswerForQuestion(q);
  }

  function validateCurrentQuestion() {
    const q = surveyQuestions[currentQuestionIndex];
    if (!q || !q.required) return true;
    return isQuestionAnswered(q);
  }

  function validateRequiredInPath(path) {
    return path.every(qid => {
      const q = surveyQuestions.find(item => Number(item.id) === Number(qid));
      if (!q || !q.required) return true;
      return isQuestionAnswered(q);
    });
  }

  function buildAnswersFromPath(path) {
    const answers = [];
    path.forEach(qid => {
      const q = surveyQuestions.find(item => Number(item.id) === Number(qid));
      if (!q) return;
      const answer = getAnswerForQuestion(q);
      if (answer) answers.push(answer);
    });
    return answers;
  }

  function renderStepActions() {
    const old = formEl.querySelector('.actions');
    if (old) old.remove();

    const path = computePath();
    const currentQuestionId = Number(surveyQuestions[currentQuestionIndex]?.id || 0);
    const pathIndex = path.indexOf(currentQuestionId);
    const isFirst = finalStepActive ? (path.length === 0) : (pathIndex <= 0);
    const nextQuestionId = getNextQuestionIdByAnswer(currentQuestionIndex);
    const hasNext = !!nextQuestionId && nextQuestionId !== '__END__' && getQuestionIndexById(nextQuestionId) >= 0;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn-secondary';
    prevBtn.textContent = 'Pergunta anterior';
    prevBtn.disabled = isFirst;
    prevBtn.addEventListener('click', () => {
      if (isFirst) return;
      if (finalStepActive) {
        const lastQuestionId = path[path.length - 1];
        const prevIndex = getQuestionIndexById(lastQuestionId);
        if (prevIndex >= 0) {
          finalStepActive = false;
          currentQuestionIndex = prevIndex;
          renderCurrentQuestion();
        }
        return;
      }
      const prevId = path[pathIndex - 1];
      const prevIndex = getQuestionIndexById(prevId);
      if (prevIndex >= 0) {
        currentQuestionIndex = prevIndex;
        renderCurrentQuestion();
      }
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = finalStepActive ? 'submit' : 'button';
    nextBtn.className = 'btn';
    nextBtn.textContent = finalStepActive ? 'Enviar respostas' : 'Próxima pergunta';
    if (!finalStepActive) {
      nextBtn.addEventListener('click', () => {
        hideMessage();
        if (!validateCurrentQuestion()) {
          showMessage('Responda esta pergunta obrigatória para continuar.', false);
          return;
        }
        if (hasNext) {
          const nextIndex = getQuestionIndexById(nextQuestionId);
          if (nextIndex >= 0) {
            currentQuestionIndex = nextIndex;
            renderCurrentQuestion();
          }
          return;
        }
        finalStepActive = true;
        renderCurrentQuestion();
      });
    }

    actions.appendChild(prevBtn);
    actions.appendChild(nextBtn);
    formEl.appendChild(actions);
  }

  function ensureProgressBar() {
    if (progressWrapEl) return progressWrapEl;
    progressWrapEl = document.createElement('div');
    progressWrapEl.className = 'progress-wrap';
    progressWrapEl.innerHTML = `
      <div class="progress-top">
        <span id="progressLabel">Progresso</span>
        <span id="progressCount">0 de 0</span>
      </div>
      <div class="progress-track">
        <div class="progress-value" id="progressValue"></div>
      </div>
    `;
    formEl.insertBefore(progressWrapEl, formEl.firstChild || null);
    return progressWrapEl;
  }

  function updateProgressBar(path) {
    const wrap = ensureProgressBar();
    const labelEl = wrap.querySelector('#progressLabel');
    const countEl = wrap.querySelector('#progressCount');
    const valueEl = wrap.querySelector('#progressValue');
    if (!labelEl || !countEl || !valueEl) return;

    if (finalStepActive) {
      labelEl.textContent = 'Finalização';
      countEl.textContent = 'Pronto para enviar';
      valueEl.style.width = '100%';
      return;
    }

    const currentQuestionId = Number(surveyQuestions[currentQuestionIndex]?.id || 0);
    const pathIndex = path.indexOf(currentQuestionId);
    const total = Math.max(path.length, 1);
    const current = Math.max(pathIndex + 1, 1);
    const percent = Math.max(0, Math.min(100, Math.round((current / total) * 100)));

    labelEl.textContent = 'Progresso';
    countEl.textContent = `${current} de ${total}`;
    valueEl.style.width = `${percent}%`;
  }

  function renderCurrentQuestion() {
    const path = computePath();
    const currentQuestionId = Number(surveyQuestions[currentQuestionIndex]?.id || 0);
    if (!path.includes(currentQuestionId) && path.length) {
      const correctedIndex = getQuestionIndexById(path[0]);
      if (correctedIndex >= 0) currentQuestionIndex = correctedIndex;
    }

    let finishStep = formEl.querySelector('.survey-finish-step');
    if (!finishStep) {
      finishStep = document.createElement('div');
      finishStep.className = 'question survey-finish-step';
      finishStep.style.display = 'none';
      finishStep.innerHTML = `
        <div class="question-label">
          <p><strong>Pronto para finalizar</strong></p>
          <p>Clique em <strong>Enviar respostas</strong> para concluir sua pesquisa.</p>
        </div>
      `;
      formEl.appendChild(finishStep);
    }

    surveyQuestions.forEach(q => {
      const el = questionEls.get(Number(q.id));
      if (!el) return;
      const active = !finalStepActive && Number(q.id) === Number(surveyQuestions[currentQuestionIndex]?.id);
      el.style.display = active ? '' : 'none';
    });
    finishStep.style.display = finalStepActive ? '' : 'none';

    updateProgressBar(path);
    renderStepActions();
  }

  async function submitAnswers(answers) {
    hideMessage();
    try {
      const response = await fetch('/api/survey_submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers })
      });
      const data = await response.json();
      if (!data.success) {
        showMessage(data.error || 'Falha ao enviar respostas.', false);
        return;
      }
      formEl.style.display = 'none';
      bodyEl.style.display = 'block';
      renderClosingPage();
    } catch (err) {
      showMessage('Erro ao enviar respostas.', false);
    }
  }

  function renderClosingSimple() {
    bodyEl.className = '';
    bodyEl.innerHTML = '';
    showMessage((window.surveyThankYou || 'Obrigado por responder.'), true);
  }

  async function submitLeadEmail(email, statusEl, submitBtn, skipBtn) {
    statusEl.className = 'msg';
    statusEl.style.display = 'none';
    try {
      submitBtn.disabled = true;
      skipBtn.disabled = true;
      const res = await fetch('/api/survey_lead_capture.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Falha ao registrar e-mail.');
      statusEl.className = 'msg success';
      statusEl.textContent = 'Perfeito. Seu e-mail foi registrado.';
      statusEl.style.display = 'block';
    } catch (err) {
      statusEl.className = 'msg';
      statusEl.textContent = err.message || 'Erro ao registrar e-mail.';
      statusEl.style.display = 'block';
      submitBtn.disabled = false;
      skipBtn.disabled = false;
    }
  }

  function renderClosingLeadCapture() {
    hideMessage();
    bodyEl.className = 'closing-wrap';
    bodyEl.innerHTML = `
      <div class="closing-brand">
        <h2>Obrigado por responder</h2>
        <p>${window.surveyThankYou || 'Sua participação é muito importante para a Ze.EFE.'}</p>
      </div>
      <div>
        <p class="lead-note">Quer receber novidades da Ze.EFE em breve? Deixe seu e-mail.</p>
        <form id="surveyLeadForm" class="lead-form">
          <div class="field">
            <label for="surveyLeadEmail">Seu e-mail</label>
            <input id="surveyLeadEmail" type="email" placeholder="voce@empresa.com" required>
          </div>
          <button type="submit" class="btn" id="surveyLeadSubmit">Quero receber novidades</button>
          <button type="button" class="btn-secondary" id="surveyLeadSkip">Agora não</button>
        </form>
      </div>
      <div class="msg" id="surveyLeadStatus"></div>
    `;
    const leadForm = document.getElementById('surveyLeadForm');
    const leadEmail = document.getElementById('surveyLeadEmail');
    const leadStatus = document.getElementById('surveyLeadStatus');
    const leadSubmit = document.getElementById('surveyLeadSubmit');
    const leadSkip = document.getElementById('surveyLeadSkip');

    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (leadEmail?.value || '').trim();
      if (!email) return;
      submitLeadEmail(email, leadStatus, leadSubmit, leadSkip);
    });

    leadSkip.addEventListener('click', () => {
      leadStatus.className = 'msg success';
      leadStatus.textContent = 'Tudo bem. Obrigado pela participação.';
      leadStatus.style.display = 'block';
      leadSkip.disabled = true;
    });
  }

  function renderClosingPage() {
    const closingType = String(surveyMeta.closing_page_type || 'simple');
    if (closingType === 'lead_capture') {
      renderClosingLeadCapture();
      return;
    }
    renderClosingSimple();
  }

  async function loadSurvey() {
    if (!token) {
      bodyEl.textContent = 'Link inválido.';
      return;
    }
    try {
      const res = await fetch(`/api/survey_public.php?t=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!data.success) {
        bodyEl.textContent = data.error || 'Questionário indisponível.';
        return;
      }
      const survey = data.survey || {};
      surveyMeta = survey;
      surveyQuestions = data.questions || [];
      rulesMap = buildRulesMap(surveyQuestions);

      window.surveyThankYou = survey.thank_you_message || '';

      formEl.innerHTML = '';
      progressWrapEl = null;
      questionEls.clear();

      surveyQuestions.forEach(q => {
        const el = renderQuestion(q);
        formEl.appendChild(el);
        questionEls.set(Number(q.id), el);
      });

      if (!surveyQuestions.length) {
        bodyEl.textContent = 'Questionário sem perguntas disponíveis.';
        return;
      }

      formEl.addEventListener('input', () => {
        hideMessage();
        renderCurrentQuestion();
      });
      formEl.addEventListener('change', () => {
        hideMessage();
        renderCurrentQuestion();
      });

      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!finalStepActive) {
          hideMessage();
          if (!validateCurrentQuestion()) {
            showMessage('Responda esta pergunta obrigatória para continuar.', false);
            return;
          }
          const nextQuestionId = getNextQuestionIdByAnswer(currentQuestionIndex);
          const nextIndex = (nextQuestionId && nextQuestionId !== '__END__') ? getQuestionIndexById(nextQuestionId) : -1;
          if (nextIndex >= 0) {
            currentQuestionIndex = nextIndex;
            renderCurrentQuestion();
            return;
          }
          finalStepActive = true;
          renderCurrentQuestion();
          return;
        }
        const path = computePath();
        if (!validateCurrentQuestion()) {
          showMessage('Responda esta pergunta obrigatória para continuar.', false);
          return;
        }
        if (!validateRequiredInPath(path)) {
          showMessage('Responda todas as perguntas obrigatórias.', false);
          return;
        }
        const answers = buildAnswersFromPath(path);
        submitAnswers(answers);
      });

      currentQuestionIndex = 0;
      finalStepActive = false;
      introStepActive = true;
      bodyEl.style.display = 'block';
      formEl.style.display = 'none';
      renderIntroStep();
    } catch (err) {
      bodyEl.textContent = 'Erro ao carregar questionário.';
    }
  }

  loadSurvey();
})();

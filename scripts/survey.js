(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const titleEl = document.getElementById('surveyTitle');
  const descEl = document.getElementById('surveyDesc');
  const bodyEl = document.getElementById('surveyBody');
  const formEl = document.getElementById('surveyForm');
  const msgEl = document.getElementById('surveyMsg');

  let surveyQuestions = [];
  let rulesMap = {};
  let currentQuestionIndex = 0;
  const questionEls = new Map();

  function showMessage(text, isSuccess) {
    msgEl.textContent = text;
    msgEl.className = 'msg' + (isSuccess ? ' success' : '');
    msgEl.style.display = 'block';
  }

  function hideMessage() {
    msgEl.style.display = 'none';
  }

  function renderQuestion(q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'question';
    wrapper.dataset.questionId = q.id;
    wrapper.dataset.type = q.type;
    wrapper.dataset.required = q.required ? '1' : '0';

    const label = document.createElement('label');
    label.textContent = q.question_text || 'Pergunta';
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
    const isFirst = pathIndex <= 0;
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
      const prevId = path[pathIndex - 1];
      const prevIndex = getQuestionIndexById(prevId);
      if (prevIndex >= 0) {
        currentQuestionIndex = prevIndex;
        renderCurrentQuestion();
      }
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = hasNext ? 'button' : 'submit';
    nextBtn.className = 'btn';
    nextBtn.textContent = hasNext ? 'Próxima pergunta' : 'Enviar respostas';
    if (hasNext) {
      nextBtn.addEventListener('click', () => {
        hideMessage();
        if (!validateCurrentQuestion()) {
          showMessage('Responda esta pergunta obrigatória para continuar.', false);
          return;
        }
        const nextIndex = getQuestionIndexById(nextQuestionId);
        if (nextIndex >= 0) {
          currentQuestionIndex = nextIndex;
          renderCurrentQuestion();
        }
      });
    }

    actions.appendChild(prevBtn);
    actions.appendChild(nextBtn);
    formEl.appendChild(actions);
  }

  function renderCurrentQuestion() {
    const path = computePath();
    const currentQuestionId = Number(surveyQuestions[currentQuestionIndex]?.id || 0);
    if (!path.includes(currentQuestionId) && path.length) {
      const correctedIndex = getQuestionIndexById(path[0]);
      if (correctedIndex >= 0) currentQuestionIndex = correctedIndex;
    }

    surveyQuestions.forEach(q => {
      const el = questionEls.get(Number(q.id));
      if (!el) return;
      const active = Number(q.id) === Number(surveyQuestions[currentQuestionIndex]?.id);
      el.style.display = active ? '' : 'none';
    });

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
      showMessage((window.surveyThankYou || 'Obrigado por responder.'), true);
    } catch (err) {
      showMessage('Erro ao enviar respostas.', false);
    }
  }

  async function loadSurvey() {
    if (!token) {
      bodyEl.textContent = 'Link inválido.';
      return;
    }
    try {
      const res = await fetch(`/api/survey_public.php?token=${token}`);
      const data = await res.json();
      if (!data.success) {
        bodyEl.textContent = data.error || 'Questionário indisponível.';
        return;
      }
      const survey = data.survey || {};
      surveyQuestions = data.questions || [];
      rulesMap = buildRulesMap(surveyQuestions);

      titleEl.textContent = survey.title || 'Questionário';
      descEl.textContent = survey.description || '';
      window.surveyThankYou = survey.thank_you_message || '';

      formEl.innerHTML = '';
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
      bodyEl.style.display = 'none';
      formEl.style.display = 'block';
      renderCurrentQuestion();
    } catch (err) {
      bodyEl.textContent = 'Erro ao carregar questionário.';
    }
  }

  loadSurvey();
})();

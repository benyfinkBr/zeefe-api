(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const titleEl = document.getElementById('surveyTitle');
  const descEl = document.getElementById('surveyDesc');
  const bodyEl = document.getElementById('surveyBody');
  const formEl = document.getElementById('surveyForm');
  const msgEl = document.getElementById('surveyMsg');

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

  function applyAnswerToQuestion(q, answer) {
    if (!answer) return;
    const qid = q.id;
    if (q.type === 'short_text' || q.type === 'number') {
      const input = formEl.querySelector(`input[name="q_${qid}"]`);
      if (input && answer.value !== undefined) input.value = answer.value;
    } else if (q.type === 'scale') {
      const input = formEl.querySelector(`input[name="q_${qid}"][value="${answer.value}"]`);
      if (input) input.checked = true;
    } else if (q.type === 'single_choice') {
      const input = formEl.querySelector(`input[name="q_${qid}"][value="${answer.option_id}"]`);
      if (input) input.checked = true;
    } else if (q.type === 'multiple_choice' && Array.isArray(answer.option_ids)) {
      answer.option_ids.forEach(id => {
        const input = formEl.querySelector(`input[name="q_${qid}[]"][value="${id}"]`);
        if (input) input.checked = true;
      });
    }
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

  function validateQuestion(q) {
    if (!q.required) return true;
    return !!getAnswerForQuestion(q);
  }

  function decideNextIndex(q, questions, rulesMap, answer) {
    if (!answer) return -1;
    const rules = rulesMap[q.id] || [];
    if (!rules.length) return -1;
    if (q.type === 'single_choice' && answer.option_id) {
      const match = rules.find(r => String(r.option_id) === String(answer.option_id));
      if (match) return questions.findIndex(item => item.id === match.target_question_id);
    }
    if (q.type === 'multiple_choice' && Array.isArray(answer.option_ids)) {
      for (const rule of rules) {
        if (answer.option_ids.map(String).includes(String(rule.option_id))) {
          return questions.findIndex(item => item.id === rule.target_question_id);
        }
      }
    }
    return -1;
  }

  function buildAnswersFromState(stateAnswers, visitedSet) {
    const answers = [];
    Object.keys(stateAnswers).forEach(key => {
      if (!visitedSet.has(Number(key))) return;
      const value = stateAnswers[key];
      if (value) answers.push(value);
    });
    return answers;
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
      const questions = data.questions || [];
      titleEl.textContent = survey.title || 'Questionário';
      descEl.textContent = survey.description || '';
      window.surveyThankYou = survey.thank_you_message || '';

      const rulesMap = {};
      questions.forEach(q => {
        const rules = [];
        (q.options || []).forEach(opt => {
          if (opt.branch_to) {
            rules.push({ option_id: opt.id, target_question_id: opt.branch_to });
          }
        });
        if (rules.length) rulesMap[q.id] = rules;
      });

      let currentIndex = 0;
      const answersState = {};
      const visited = new Set();
      const history = [];

      formEl.innerHTML = '';
      const questionHolder = document.createElement('div');
      formEl.appendChild(questionHolder);
      const actions = document.createElement('div');
      actions.className = 'actions';
      const backBtn = document.createElement('button');
      backBtn.type = 'button';
      backBtn.className = 'btn-secondary';
      backBtn.textContent = 'Voltar';
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'btn';
      nextBtn.textContent = 'Próximo';
      actions.appendChild(backBtn);
      actions.appendChild(nextBtn);
      formEl.appendChild(actions);

      function renderCurrent() {
        questionHolder.innerHTML = '';
        const q = questions[currentIndex];
        if (!q) return;
        questionHolder.appendChild(renderQuestion(q));
        applyAnswerToQuestion(q, answersState[q.id] || null);
        backBtn.style.display = history.length ? '' : 'none';
        nextBtn.textContent = currentIndex === questions.length - 1 ? 'Enviar' : 'Próximo';
      }

      function goToIndex(index) {
        if (index < 0 || index >= questions.length) return;
        currentIndex = index;
        renderCurrent();
      }

      backBtn.addEventListener('click', () => {
        if (!history.length) return;
        const prev = history.pop();
        currentIndex = prev;
        renderCurrent();
      });

      nextBtn.addEventListener('click', async () => {
        const q = questions[currentIndex];
        if (!validateQuestion(q)) {
          showMessage('Responda todas as perguntas obrigatórias.', false);
          return;
        }
        hideMessage();
        const ans = getAnswerForQuestion(q);
        if (ans) answersState[q.id] = ans;
        else delete answersState[q.id];
        visited.add(q.id);

        let nextIndex = decideNextIndex(q, questions, rulesMap, ans);
        if (nextIndex === -1) nextIndex = currentIndex + 1;

        if (nextIndex >= questions.length) {
          nextBtn.disabled = true;
          const answersPayload = buildAnswersFromState(answersState, visited);
          await submitAnswers(answersPayload);
          nextBtn.disabled = false;
          return;
        }

        history.push(currentIndex);
        goToIndex(nextIndex);
      });

      bodyEl.style.display = 'none';
      formEl.style.display = 'block';
      renderCurrent();
    } catch (err) {
      bodyEl.textContent = 'Erro ao carregar questionário.';
    }
  }

  loadSurvey();
})();

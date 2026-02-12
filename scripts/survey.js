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

  function buildAnswers(questions, visibleSet) {
    const answers = [];
    for (const q of questions) {
      if (!visibleSet.has(q.id)) continue;
      const answer = getAnswerForQuestion(q);
      if (answer) answers.push(answer);
    }
    return answers;
  }

  function validateRequired(questions, visibleSet) {
    for (const q of questions) {
      if (!visibleSet.has(q.id)) continue;
      if (!q.required) continue;
      const answer = getAnswerForQuestion(q);
      if (!answer) return false;
    }
    return true;
  }

  function buildRulesMap(questions) {
    const rulesMap = {};
    questions.forEach(q => {
      const rules = [];
      (q.options || []).forEach(opt => {
        if (opt.branch_to) {
          rules.push({ option_id: String(opt.id), target_question_id: opt.branch_to });
        }
      });
      if (rules.length) rulesMap[q.id] = rules;
    });
    return rulesMap;
  }

  function computeVisibleSet(questions, rulesMap) {
    const idToIndex = new Map();
    questions.forEach((q, i) => idToIndex.set(q.id, i));
    const visible = new Set();
    if (!questions.length) return visible;

    const queue = [0];
    const processed = new Set();

    while (queue.length) {
      const index = queue.shift();
      if (index < 0 || index >= questions.length) continue;
      if (processed.has(index)) continue;
      processed.add(index);
      const q = questions[index];
      visible.add(q.id);

      let nextIndices = [];
      const rules = rulesMap[q.id] || [];
      const answer = getAnswerForQuestion(q);

      if (rules.length && answer) {
        if (q.type === 'single_choice' && answer.option_id) {
          const match = rules.find(r => r.option_id === String(answer.option_id));
          if (match && idToIndex.has(match.target_question_id)) {
            nextIndices.push(idToIndex.get(match.target_question_id));
          } else {
            nextIndices.push(index + 1);
          }
        } else if (q.type === 'multiple_choice' && Array.isArray(answer.option_ids)) {
          const selected = answer.option_ids.map(String);
          const targets = rules
            .filter(r => selected.includes(String(r.option_id)))
            .map(r => idToIndex.get(r.target_question_id))
            .filter(v => v !== undefined);
          if (targets.length) {
            nextIndices = nextIndices.concat(targets);
          } else {
            nextIndices.push(index + 1);
          }
        } else {
          nextIndices.push(index + 1);
        }
      } else {
        nextIndices.push(index + 1);
      }

      nextIndices.forEach(i => {
        if (i < questions.length) queue.push(i);
      });
    }

    return visible;
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

      formEl.innerHTML = '';
      const questionEls = new Map();
      questions.forEach(q => {
        const el = renderQuestion(q);
        formEl.appendChild(el);
        questionEls.set(q.id, el);
      });

      const actions = document.createElement('div');
      actions.className = 'actions';
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'btn';
      submit.textContent = 'Enviar respostas';
      actions.appendChild(submit);
      formEl.appendChild(actions);

      const rulesMap = buildRulesMap(questions);

      const updateVisibility = () => {
        const visibleSet = computeVisibleSet(questions, rulesMap);
        questions.forEach(q => {
          const el = questionEls.get(q.id);
          if (!el) return;
          el.style.display = visibleSet.has(q.id) ? '' : 'none';
        });
      };

      formEl.addEventListener('input', updateVisibility);
      formEl.addEventListener('change', updateVisibility);

      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const visibleSet = computeVisibleSet(questions, rulesMap);
        if (!validateRequired(questions, visibleSet)) {
          showMessage('Responda todas as perguntas obrigatórias.', false);
          return;
        }
        const answers = buildAnswers(questions, visibleSet);
        submitAnswers(answers);
      });

      bodyEl.style.display = 'none';
      formEl.style.display = 'block';
      updateVisibility();
    } catch (err) {
      bodyEl.textContent = 'Erro ao carregar questionário.';
    }
  }

  loadSurvey();
})();

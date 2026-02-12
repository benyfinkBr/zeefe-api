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

  function buildAnswers(questions) {
    const answers = [];
    for (const q of questions) {
      const qid = q.id;
      const required = !!q.required;
      const type = q.type;
      let answer = null;

      if (type === 'short_text') {
        const input = formEl.querySelector(`input[name="q_${qid}"]`);
        const value = input ? input.value.trim() : '';
        if (required && !value) return { error: 'Responda todas as perguntas obrigatórias.' };
        if (value) answer = { question_id: qid, value };
      } else if (type === 'number') {
        const input = formEl.querySelector(`input[name="q_${qid}"]`);
        const value = input ? input.value.trim() : '';
        if (required && value === '') return { error: 'Responda todas as perguntas obrigatórias.' };
        if (value !== '') answer = { question_id: qid, value };
      } else if (type === 'scale') {
        const selected = formEl.querySelector(`input[name="q_${qid}"]:checked`);
        const value = selected ? selected.value : '';
        if (required && !value) return { error: 'Responda todas as perguntas obrigatórias.' };
        if (value) answer = { question_id: qid, value };
      } else if (type === 'single_choice') {
        const selected = formEl.querySelector(`input[name="q_${qid}"]:checked`);
        const value = selected ? selected.value : '';
        if (required && !value) return { error: 'Responda todas as perguntas obrigatórias.' };
        if (value) answer = { question_id: qid, option_id: value };
      } else if (type === 'multiple_choice') {
        const selected = Array.from(formEl.querySelectorAll(`input[name="q_${qid}[]"]:checked`)).map(el => el.value);
        if (required && selected.length === 0) return { error: 'Responda todas as perguntas obrigatórias.' };
        if (selected.length) answer = { question_id: qid, option_ids: selected };
      }

      if (answer) answers.push(answer);
    }

    return { answers };
  }

  async function submitAnswers(questions) {
    hideMessage();
    const res = buildAnswers(questions);
    if (res.error) {
      showMessage(res.error, false);
      return;
    }
    try {
      const response = await fetch('/api/survey_submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers: res.answers })
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
      questions.forEach(q => formEl.appendChild(renderQuestion(q)));
      const actions = document.createElement('div');
      actions.className = 'actions';
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'btn';
      submit.textContent = 'Enviar respostas';
      actions.appendChild(submit);
      formEl.appendChild(actions);

      bodyEl.style.display = 'none';
      formEl.style.display = 'block';
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        submitAnswers(questions);
      });
    } catch (err) {
      bodyEl.textContent = 'Erro ao carregar questionário.';
    }
  }

  loadSurvey();
})();

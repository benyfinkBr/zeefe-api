const form = document.getElementById('workshopReviewForm');
const message = document.getElementById('reviewMessage');
const codeInput = document.getElementById('reviewCode');
const params = new URLSearchParams(window.location.search);
const code = params.get('code') || '';
if (codeInput) codeInput.value = code;

function getSelectedValue(name) {
  const el = form?.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!codeInput?.value) {
    message.textContent = 'Código inválido.';
    return;
  }
  const ratingEvent = getSelectedValue('rating_event');
  const ratingPlatform = getSelectedValue('rating_platform');
  if (!ratingEvent || !ratingPlatform) {
    message.textContent = 'Selecione as notas para evento e plataforma.';
    return;
  }
  message.textContent = 'Enviando...';
  try {
    const res = await fetch('/api/workshop_feedback_submit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_code: codeInput.value,
        rating_event: Number(ratingEvent),
        rating_platform: Number(ratingPlatform),
        comments_event: document.getElementById('commentsEvent')?.value || '',
        comments_platform: document.getElementById('commentsPlatform')?.value || '',
        is_public: document.getElementById('reviewPublic')?.checked ? 1 : 0
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível enviar.');
    message.textContent = 'Obrigado! Sua avaliação foi registrada.';
    form.reset();
  } catch (err) {
    message.textContent = err.message || 'Erro ao enviar avaliação.';
  }
});

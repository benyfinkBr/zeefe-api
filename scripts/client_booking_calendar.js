(() => {
  const calendarGrid = document.getElementById('bookingCalendarGrid');
  const calendarLabel = document.getElementById('bookingCalendarLabel');
  const prevBtn = document.getElementById('bookingPrevMonth');
  const nextBtn = document.getElementById('bookingNextMonth');
  const hiddenInput = document.getElementById('bookingDateInput');
  if (!calendarGrid || !calendarLabel || !hiddenInput) return;

  const today = new Date();
  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar(currentMonth);

  prevBtn?.addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar(currentMonth);
  });
  nextBtn?.addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar(currentMonth);
  });

  function renderCalendar(reference) {
    calendarGrid.innerHTML = '';
    const year = reference.getFullYear();
    const month = reference.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    calendarLabel.textContent = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdayNames.forEach(name => {
      const cell = document.createElement('div');
      cell.className = 'calendar-day disabled';
      cell.textContent = name;
      calendarGrid.appendChild(cell);
    });

    for (let i = 0; i < start.getDay(); i++) {
      const filler = document.createElement('div');
      filler.className = 'calendar-day disabled';
      calendarGrid.appendChild(filler);
    }

    const todayISO = toISO(today);
    const selectedISO = hiddenInput.value;

    for (let day = 1; day <= end.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      const iso = toISO(currentDate);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'calendar-day available';
      cell.textContent = String(day);

      if (iso < todayISO) {
        cell.classList.add('disabled');
        cell.disabled = true;
      } else {
        cell.addEventListener('click', () => {
          hiddenInput.value = iso;
          renderCalendar(reference);
          hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      if (iso === selectedISO) {
        cell.classList.add('selected');
      }

      calendarGrid.appendChild(cell);
    }
  }

  function toISO(d) {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy.toISOString().split('T')[0];
  }
})();

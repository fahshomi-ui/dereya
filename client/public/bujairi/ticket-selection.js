(function () {
  'use strict';
  var payload = document.getElementById('ticket-selection-data');
  if (!payload) return;
  var snapshot = JSON.parse(payload.textContent);
  var language = document.body.getAttribute('data-ticket-selection') || 'ar';
  var calendar = window.DiriyahCalendar;
  var data = calendar.build(snapshot, language, new Date());
  var basePath = '/bujairi/'+language + '/b/3552/diriyah-access/index.html';
  var storageKey = 'diriyah-ui-selection-3552-v1';
  var performances = Object.create(null);
  data.performances.forEach(function (performance) { performances[performance.dateId] = performance; });
  var dateRow = document.querySelector('#wrap .dates-row');
  var dateTemplate = dateRow.querySelector('.dateSelector').cloneNode(true);
  var rolloverTimer;
  var templateRow = document.querySelector('.catList input.catQty').closest('.cart-row').cloneNode(true);
  var rowContainer = document.querySelector('.catList .card-body');
  var totalRow = document.getElementById('cartTotal').closest('.cart-row');
  var timeTemplate = document.querySelector('.timeSelector').cloneNode(true);
  var state = { dateId: data.dates[0].id, timeId: '', quantities: Object.create(null) };
  try {
    var saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      if (typeof saved.dateId === 'string' && performances[saved.dateId]) {
        state.dateId = saved.dateId;
        state.timeId = typeof saved.timeId === 'string' ? saved.timeId : '';
      }
      if (saved.quantities && typeof saved.quantities === 'object' && !Array.isArray(saved.quantities)) {
        Object.keys(saved.quantities).forEach(function (dateId) {
          if (!performances[dateId]) return;
          var counts = saved.quantities[dateId];
          if (!counts || typeof counts !== 'object' || Array.isArray(counts)) return;
          state.quantities[dateId] = Object.create(null);
          performances[dateId].tickets.forEach(function (ticket) {
            var value = Number(counts[ticket.id]);
            if (Number.isFinite(value)) {
              state.quantities[dateId][ticket.id] = Math.max(ticket.min, Math.min(ticket.max, Math.trunc(value)));
            }
          });
        });
      }
    }
  } catch (_) {}

  function renderDates() {
    var fragment = document.createDocumentFragment();
    var scrollPosition = dateRow.scrollLeft;
    data.dates.forEach(function (date) {
      var link = dateTemplate.cloneNode(true);
      link.setAttribute('data-dateid', date.id);
      link.setAttribute('data-calendar-date', date.isoDate);
      link.href = date.href;
      link.classList.remove('active', 'disable');
      link.querySelector('.month').textContent = date.month;
      link.querySelector('.day').textContent = date.day;
      link.querySelector('.day-name').textContent = date.dayName;
      fragment.appendChild(link);
      fragment.appendChild(document.createTextNode(' '));
    });
    dateRow.replaceChildren(fragment);
    dateRow.scrollLeft = scrollPosition;
  }
  function refreshCalendar(now) {
    now = now || new Date();
    var zone = snapshot.calendar && snapshot.calendar.timeZone;
    if (calendar.today(now, zone) === data.today) return false;
    var next = calendar.build(snapshot, language, now);
    data = next;
    performances = Object.create(null);
    data.performances.forEach(function (performance) { performances[performance.dateId] = performance; });
    Object.keys(state.quantities).forEach(function (dateId) {
      if (!performances[dateId]) delete state.quantities[dateId];
    });
    if (!performances[state.dateId]) {
      state.dateId = data.dates[0].id;
      state.timeId = '';
      dateRow.scrollLeft = 0;
      if (window.jQuery) window.jQuery('#ticket-review').modal('hide');
    }
    renderDates();
    return true;
  }
  function checkDay() {
    var now = new Date();
    if (refreshCalendar(now)) render(false);
    window.clearTimeout(rolloverTimer);
    var zone = snapshot.calendar && snapshot.calendar.timeZone;
    var delay = calendar.millisecondsToNextDay(now, zone);
    rolloverTimer = window.setTimeout(checkDay, Math.min(60000, delay + 25));
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {}
  }
  function number(value) {
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  function localTime(label) {
    return language === 'ar' ? label : label.replace(/بعد منتصف الليل/g, 'After Midnight').replace(/م/g, 'pm').replace(/ص/g, 'am');
  }
  function performance() { return performances[state.dateId]; }
  function quantities() {
    if (!state.quantities[state.dateId]) state.quantities[state.dateId] = {};
    return state.quantities[state.dateId];
  }
  function amount(ticket) {
    var value = Number(quantities()[ticket.id]) || 0;
    return Math.max(ticket.min, Math.min(ticket.max, Math.trunc(value)));
  }
  function total() {
    return performance().tickets.reduce(function (sum, ticket) {
      return sum + amount(ticket) * Math.round(ticket.price * 100);
    }, 0) / 100;
  }
  function updateTotals() {
    performance().tickets.forEach(function (ticket) {
      var input = document.querySelector('.catList input[data-id="' + ticket.id + '"]');
      if (!input) return;
      var value = amount(ticket);
      quantities()[ticket.id] = value;
      input.value = String(value);
      input.setAttribute('aria-valuenow', String(value));
      var row = input.closest('.cart-row');
      row.querySelector('.catinc').setAttribute('aria-disabled', String(value >= ticket.max));
      row.querySelector('.catdec').setAttribute('aria-disabled', String(value <= ticket.min));
    });
    document.getElementById('cartTotal').textContent = number(total());
    save();
  }
  function updateUrl(push) {
    var url = basePath + '?d=' + encodeURIComponent(state.dateId);
    if (state.timeId) url += '&t=' + encodeURIComponent(state.timeId);
    if (push) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
    document.querySelectorAll('a.languageLink').forEach(function (link) {
      link.href = '/bujairi/'+(language === 'ar' ? 'en' : 'ar') + '/b/3552/diriyah-access/index.html?d=' +
        encodeURIComponent(state.dateId) + '&t=' + encodeURIComponent(state.timeId);
    });
  }
  function render(push) {
    var current = performance();
    if (!current.times.some(function (time) { return time.id === state.timeId; })) {
      state.timeId = current.times.length ? current.times[0].id : '';
    }
    document.querySelectorAll('#wrap .dateSelector').forEach(function (link) {
      var active = link.getAttribute('data-dateid') === state.dateId;
      link.classList.toggle('active', active);
      link.setAttribute('aria-current', active ? 'date' : 'false');
    });
    var times = document.querySelector('.times-row');
    times.textContent = '';
    current.times.forEach(function (time) {
      var link = timeTemplate.cloneNode(true);
      link.textContent = localTime(time.label);
      link.setAttribute('data-dateid', state.dateId);
      link.setAttribute('data-timeid', time.id);
      link.href = basePath + '?d=' + state.dateId + '&t=' + time.id;
      link.classList.toggle('active', time.id === state.timeId);
      times.appendChild(link);
      times.appendChild(document.createTextNode(' '));
    });
    rowContainer.querySelectorAll('.cart-row').forEach(function (row) {
      if (row !== totalRow) row.remove();
    });
    current.tickets.forEach(function (ticket) {
      var row = templateRow.cloneNode(true);
      var input = row.querySelector('input.catQty');
      input.id = 'txtQty' + ticket.id;
      input.setAttribute('data-id', ticket.id);
      input.setAttribute('data-language', language);
      input.max = String(ticket.max);
      input.min = String(ticket.min);
      var limit = row.querySelector('.event-name label span');
      if (limit) { limit.id = 'lblQty' + ticket.id; limit.textContent = String(ticket.max); }
      var price = row.querySelector('.the-price');
      price.textContent = templateRow.querySelector('.the-price').textContent.replace(/[0-9.,]+/, ticket.price.toFixed(2));
      rowContainer.insertBefore(row, totalRow);
    });
    updateTotals();
    updateUrl(push);
  }
  function fromUrl() {
    refreshCalendar();
    var params = new URLSearchParams(location.search);
    var date = params.get('d');
    if (date && performances[date]) state.dateId = date;
    else if (date || !performances[state.dateId]) state.dateId = data.dates[0].id;
    state.timeId = params.get('t') || '';
    render(false);
  }
  function showAddedVisitorNotice() {
    if (!window.alertify) return;
    // Reproduce the source UI message; the selection remains a local UI simulation.
    window.alertify.dismissAll();
    var sourceMessage = language === 'ar'
      ? 'تم الحجز                         و الوقت المتاح لاتمام الحجز هو 10 دقايق'
      : 'Reserved     , please complete your purchase in 10 minutes';
    window.alertify.notify(sourceMessage, 'success', 50, function () {});
  }
  function adjust(control, difference) {
    var input = control.closest('.cart-row').querySelector('input.catQty');
    var ticket = performance().tickets.find(function (item) { return item.id === input.getAttribute('data-id'); });
    if (!ticket) return;
    var previous = amount(ticket);
    var next = Math.max(ticket.min, Math.min(ticket.max, previous + difference));
    quantities()[ticket.id] = next;
    updateTotals();
    if (difference > 0 && next > previous) showAddedVisitorNotice();
  }
  function review() {
    var count = performance().tickets.reduce(function (sum, ticket) { return sum + amount(ticket); }, 0);
    if (count === 0) {
      if (window.alertify) {
        window.alertify.alert().setting({
          title: language === 'ar' ? 'ملاحظة' : 'Notice',
          message: language === 'ar' ? 'يرجي اختيار التذاكر أولا' : 'Please choose ticket first',
          closable: false
        }).show();
      }
      return;
    }
    save();
    var content = document.getElementById('ticket-review-content');
    content.textContent = '';
    var selectedDate = document.querySelector('#wrap .dateSelector.active');
    var selectedTime = document.querySelector('#wrap .timeSelector.active');
    var dateTime = document.createElement('div');
    dateTime.className = 'dates-times mb-3';
    if (selectedDate) dateTime.appendChild(selectedDate.cloneNode(true));
    if (selectedTime) dateTime.appendChild(selectedTime.cloneNode(true));
    dateTime.querySelectorAll('a').forEach(function (link) { link.removeAttribute('href'); });
    content.appendChild(dateTime);
    var cart = document.createElement('div');
    cart.className = 'cart';
    cart.appendChild(document.querySelector('.catList .card').cloneNode(true));
    cart.querySelectorAll('[id]').forEach(function (item) { item.removeAttribute('id'); });
    cart.querySelectorAll('.catinc,.catdec,input').forEach(function (item) {
      item.inert = true;
      item.setAttribute('tabindex', '-1');
    });
    content.appendChild(cart);
    var sourceButton = document.getElementById('btnCatGoToCart');
    var completePayment = document.createElement('button');
    completePayment.id = 'btnTicketCompletePayment';
    completePayment.type = 'button';
    completePayment.className = sourceButton.className;
    completePayment.classList.remove('gtmLink');
    completePayment.textContent = language === 'ar' ? 'اتمام الدفع' : 'Complete Payment';
    completePayment.inert = true;
    completePayment.setAttribute('aria-disabled', 'true');
    content.appendChild(completePayment);
    if (window.jQuery) window.jQuery('#ticket-review').modal('show');
  }
  document.addEventListener('click', function (event) {
    var date = event.target.closest('.dates-times .dateSelector');
    if (date && !date.closest('#ticket-review')) {
      event.preventDefault();
      var dateId = date.getAttribute('data-dateid');
      state.dateId = performances[dateId] ? dateId : data.dates[0].id;
      state.timeId = '';
      render(true);
      return;
    }
    var time = event.target.closest('.dates-times .timeSelector');
    if (time && !time.closest('#ticket-review')) {
      event.preventDefault();
      state.timeId = time.getAttribute('data-timeid');
      render(true);
      return;
    }
    var up = event.target.closest('.catList .catinc');
    var down = event.target.closest('.catList .catdec');
    if (up || down) {
      event.preventDefault();
      adjust(up || down, up ? 1 : -1);
    }
    if (event.target.closest('#btnCatGoToCart')) {
      event.preventDefault();
      review();
    }
  });
  document.addEventListener('keydown', function (event) {
    var control = event.target.closest('.catList .catinc,.catList .catdec');
    if (control && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      adjust(control, control.classList.contains('catinc') ? 1 : -1);
    }
  });
  window.addEventListener('popstate', fromUrl);
  window.addEventListener('focus', checkDay);
  window.addEventListener('pageshow', checkDay);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) checkDay();
  });
  renderDates();
  fromUrl();
  checkDay();
}());

(function () {
  'use strict';
  var element = document.getElementById('restaurant-public-data');
  if (!element) return;
  var data = JSON.parse(element.textContent);
  function total() {
    var input = document.querySelector('.catRestaurantQty');
    var count = input ? Number(input.value) : 0;
    var time = document.querySelector('.timeSelectorRestaurant.active');
    var charge = Math.max(Number(data.minimumPriceFloor || 0),
      time ? Number(time.getAttribute('data-price')) : Number(data.minimumCharge));
    document.querySelectorAll('.cartRestaurantTotal').forEach(function (target) {
      target.textContent = String(charge * count);
    });
  }
  document.addEventListener('click', function (event) {
    var button = event.target.closest('.catincRestaurant,.catdecRestaurant');
    if (button) {
      event.preventDefault();
      var input = button.parentElement.querySelector('input.catRestaurantQty');
      if (!input) return;
      var change = button.classList.contains('catincRestaurant') ? 1 : -1;
      var next = Number(input.value) + change;
      if (next > Number(input.max) || next < Number(input.min)) {
        if (change > 0 && window.alertify) window.alertify.alert(data.language === 'ar' ?
          'لقد وصلت للحد الأقصى المسموح به لكل فرد' : 'You have reached the maximum limit for each user');
        return;
      }
      button.classList.add('a' + next);
      input.value = String(next);
      total();
      return;
    }
    var proceed = event.target.closest('.btnRestaurantGoToCart');
    if (proceed) {
      event.preventDefault();
      var time = document.querySelector('.timeSelectorRestaurant.active');
      if (!time) {
        if (window.alertify) window.alertify.alert(data.language === 'ar' ? 'يرجي اختيار الوقت أولا' : 'Please choose time first');
        return;
      }
      var guests = Array.from(document.querySelectorAll('.catList .catRestaurantQty')).reduce(function (sum, input) { return sum + Number(input.value); }, 0);
      if (!Number.isInteger(guests) || guests <= 0) {
        if (window.alertify) window.alertify.alert(data.language === 'ar' ? 'يرجي اختيار عدد الضيوف أولا' : 'Please choose number of guests first');
        return;
      }
      var date = document.getElementById('dateSelectorRestaurant');
      var parts = location.pathname.replace(/^\/bujairi\//,'/').replace(/\/index\.html$/,'').split('/').filter(Boolean);
      var title = document.querySelector('.event-title .title') || document.querySelector('.event-title');
      if (!date || !date.selectedOptions.length || parts.length !== 5) return;
      var price = Math.max(Number(data.minimumPriceFloor || 0), Number(time.getAttribute('data-price')));
      var now = Date.now();
      var selection = {restaurantId: parts[3], slug: parts[4], language: data.language,
        name: title ? title.textContent.trim() : proceed.title,
        date: date.value, dateLabel: date.selectedOptions[0].textContent.trim(),
        time: time.getAttribute('data-timeid'), timeLabel: time.innerText.replace(/\s+/g, ' ').trim(),
        guests: guests, unitPrice: price, total: price * guests, createdAt: now, expiresAt: now + 600000};
      try { sessionStorage.setItem('bujairi-restaurant-summary-v1', JSON.stringify(selection)); }
      catch (_) { return; }
      location.assign('/bujairi/'+data.language + '/Wallet/Cart/index.html');
    }
  });
  var dates = document.getElementById('dateSelectorRestaurant');
  if (dates) dates.addEventListener('change', total);
  total();
}());

(function () {
  'use strict';
  var element = document.getElementById('booking-summary-data');
  if (!element) return;
  var model = JSON.parse(element.textContent);
  var language = model.language;
  var key = 'bujairi-restaurant-summary-v1';
  var selection;
  try { selection = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (_) {}
  var restaurant = selection && model.restaurants.find(function (item) {
    return item.id === String(selection.restaurantId) && item.slug === selection.slug;
  });
  var valid = restaurant && Number.isInteger(selection.guests) &&
    selection.guests >= restaurant.minGuests && selection.guests <= restaurant.maxGuests &&
    restaurant.dates.indexOf(selection.date) !== -1 &&
    Object.prototype.hasOwnProperty.call(restaurant.prices, selection.time) &&
    Number.isFinite(selection.createdAt) && Number.isFinite(selection.expiresAt) &&
    selection.createdAt <= Date.now() + 1000 && selection.expiresAt > Date.now() &&
    selection.expiresAt - selection.createdAt === 600000;
  if (!valid) {
    location.replace('/bujairi/'+language + '/Restaurants/g/17/bujairi/index.html');
    return;
  }
  var price = restaurant.prices[selection.time];
  var amount = price * selection.guests;
  function fill(selector, value, decimal) {
    var target = document.querySelector(selector);
    if (!target) return;
    var template = target.getAttribute('data-value-template');
    target.textContent = template ? template.replace(/\d+(?:\.\d+)?/, decimal ? value.toFixed(2) : String(value)) : String(value);
  }
  fill('[data-summary-name]', restaurant.names[language], false);
  fill('[data-summary-guests]', selection.guests, false);
  fill('[data-summary-unit-price]', price, true);
  fill('[data-summary-line-total]', amount, true);
  fill('[data-summary-total]', amount, true);
  // Source wallet review does not show date/time as extra rows: preserve its exact layout.
  var name = document.querySelector('[data-summary-name]');
  if (name) {
    name.setAttribute('data-summary-date', selection.date);
    name.setAttribute('data-summary-time', selection.time);
    name.title = selection.date + ' ' + selection.time.slice(0, 2) + ':' + selection.time.slice(2);
  }
  var pay = document.getElementById('btnPayNow');
  if (pay) { pay.inert = true; pay.setAttribute('aria-disabled', 'true'); }
  var timer;
  function countdown() {
    var remaining = Math.max(0, Math.ceil((selection.expiresAt - Date.now()) / 1000));
    var target = document.querySelector('.runner');
    if (target) target.textContent = String(Math.floor(remaining / 60)).padStart(2, '0') + ':' + String(remaining % 60).padStart(2, '0');
    if (!remaining) {
      sessionStorage.removeItem(key);
      location.replace('/bujairi/'+language + '/Restaurants/b/' + restaurant.id + '/' + restaurant.slug+'/index.html');
      return;
    }
    timer = setTimeout(countdown, 1000);
  }
  countdown();
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { clearTimeout(timer); countdown(); }
  });
}());

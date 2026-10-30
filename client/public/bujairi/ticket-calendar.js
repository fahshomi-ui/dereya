(function () {
  'use strict';
  var defaultTimeZone = 'Asia/Riyadh';

  function parts(now, timeZone) {
    var result = Object.create(null);
    new Intl.DateTimeFormat('en-GB-u-ca-gregory', {
      timeZone: timeZone || defaultTimeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(now).forEach(function (part) { result[part.type] = part.value; });
    return result;
  }
  function today(now, timeZone) {
    var value = parts(now || new Date(), timeZone);
    return value.year + '-' + value.month + '-' + value.day;
  }
  function addDays(key, count) {
    var value = new Date(key + 'T12:00:00Z');
    value.setUTCDate(value.getUTCDate() + count);
    return value.toISOString().slice(0, 10);
  }
  function millisecondsToNextDay(now, timeZone) {
    var value = parts(now, timeZone);
    var elapsed = Number(value.hour) * 3600000 + Number(value.minute) * 60000 +
      Number(value.second) * 1000 + now.getUTCMilliseconds();
    return 86400000 - elapsed;
  }
  function build(snapshot, language, now) {
    var settings = snapshot.calendar || {};
    var first = today(now || new Date(), settings.timeZone);
    var anchor = settings.anchorDate || '2026-10-29';
    var count = Number(settings.windowDays) || snapshot.dates.length;
    var knownDates = Object.create(null);
    var knownPerformances = Object.create(null);
    var weekdayTemplates = Object.create(null);
    snapshot.performances.forEach(function (performance) {
      knownPerformances[performance.dateId] = performance;
    });
    snapshot.dates.forEach(function (date, index) {
      var key = addDays(anchor, index);
      knownDates[key] = date;
      var weekday = new Date(key + 'T12:00:00Z').getUTCDay();
      if (!weekdayTemplates[weekday] && knownPerformances[date.id]) {
        weekdayTemplates[weekday] = knownPerformances[date.id];
      }
    });
    var locale = language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US-u-ca-gregory';
    var monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
    var weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
    var dates = [];
    var performances = [];
    for (var offset = 0; offset < count; offset++) {
      var key = addDays(first, offset);
      var civilDate = new Date(key + 'T12:00:00Z');
      var original = knownDates[key];
      var id = original ? original.id : key;
      var source = original ? knownPerformances[id] : weekdayTemplates[civilDate.getUTCDay()];
      source = source || snapshot.performances[0];
      dates.push({
        id: id, isoDate: key, day: String(civilDate.getUTCDate()),
        month: monthFormatter.format(civilDate),
        dayName: offset === 0 ? (language === 'ar' ? 'اليوم' : 'Today') :
          offset === 1 ? (language === 'ar' ? 'غدا' : 'Tomorrow') : weekdayFormatter.format(civilDate),
        href: '/bujairi/'+language + '/b/3552/diriyah-access/index.html?d=' + encodeURIComponent(id)
      });
      // New days use local calendar identifiers, never guessed source inventory IDs.
      performances.push({
        dateId: id,
        times: source.times.map(function (time, index) {
          return { id: original ? time.id : 'local-' + key + '-time-' + index, label: time.label };
        }),
        tickets: source.tickets.map(function (ticket, index) {
          return { id: original ? ticket.id : 'local-' + key + '-ticket-' + index,
            min: ticket.min, max: ticket.max, price: ticket.price, name: ticket.name };
        })
      });
    }
    return { today: first, dates: dates, performances: performances };
  }
  window.DiriyahCalendar = {
    build: build, today: today, addDays: addDays, millisecondsToNextDay: millisecondsToNextDay
  };
}());

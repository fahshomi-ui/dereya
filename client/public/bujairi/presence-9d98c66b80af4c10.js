(function () {
  'use strict';
  var marker = 'bujairi:page';
  if (window.parent !== window) {
    function reportPage() {
      window.parent.postMessage({ type: marker, path: location.pathname }, location.origin);
    }
    window.addEventListener('pageshow', reportPage);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reportPage, { once: true });
    else reportPage();
    return;
  }
  // Standalone static links use the same application shell and one presence connection.
  if (location.pathname.indexOf('/bujairi/') === 0) {
    var pagePath = location.pathname;
    if (!/\.html$/.test(pagePath)) pagePath = pagePath.replace(/\/$/, '') + '/index.html';
    location.replace('/bujairi-terrace?bujairi_page=' + encodeURIComponent(pagePath + location.search + location.hash));
    return;
  }
  window.__bujairiStartPresence = function (options) {
    var disposed = false;
    var running = false;
    var restricted = false;
    var generation = 0;
    var timer = null;
    var currentSocket = null;
    var currentPath = options.path;
    var base = options.apiBase.replace(/\/$/, '');
    var sessionId;
    try { sessionId = sessionStorage.getItem('bujairi-presence-session-v1'); } catch (_) {}
    if (!sessionId) {
      sessionId = 'pv_' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());
      try { sessionStorage.setItem('bujairi-presence-session-v1', sessionId); } catch (_) {}
    }
    function request(path, leaving) {
      var body = JSON.stringify({ sessionId: sessionId });
      if (leaving && navigator.sendBeacon) {
        try {
          if (navigator.sendBeacon(base + path, new Blob([body], { type: 'application/json' }))) return;
        } catch (_) {}
      }
      fetch(base + path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body,
        keepalive: Boolean(leaving)
      }).catch(function () {});
    }
    function visitorId() {
      try { return localStorage.getItem('visitorId') || ''; } catch (_) { return ''; }
    }
    function stop() {
      generation += 1;
      if (timer !== null) { clearInterval(timer); timer = null; }
      if (running) request('/api/page-leave', true);
      running = false;
      var socket = currentSocket;
      currentSocket = null;
      if (socket) {
        if (socket.io && socket.io.opts) socket.io.opts.reconnection = false;
        socket.disconnect();
      }
    }
    function start() {
      var blocked = false;
      try { blocked = localStorage.getItem('visitor_blocked') === 'true'; } catch (_) {}
      if (disposed || restricted || blocked || running || document.hidden) return;
      running = true;
      var epoch = ++generation;
      request('/api/page-ping', false);
      timer = setInterval(function () {
        if (!disposed && running && !document.hidden) request('/api/page-ping', false);
      }, 15000);
      // Preserve the existing verification; never fabricate behavior or bypass a denial.
      Promise.resolve().then(function () {
        if (disposed || !running || document.hidden || epoch !== generation) return null;
        return options.verify(base);
      }).then(function (result) {
        if (disposed || !running || document.hidden || epoch !== generation || !result || !result.success || !result.token) return;
        var socket = options.createSocket(base, {
          transports: ['polling', 'websocket'], autoConnect: false,
          reconnection: true, reconnectionDelay: 1000,
          auth: { token: result.token }, query: { visitorId: visitorId() }
        });
        currentSocket = socket;
        socket.on('connect', function () {
          if (disposed || !running || document.hidden || socket !== currentSocket) return;
          var id = visitorId();
          socket.emit('visitor:register', { visitorId: id, existingVisitorId: id });
        });
        socket.on('successfully-connected', function (data) {
          if (disposed || !running || socket !== currentSocket) return;
          if (data && typeof data.pid === 'string') {
            try { localStorage.setItem('visitorId', data.pid); } catch (_) {}
          }
          socket.emit('visitor:pageEnter', currentPath);
        });
        socket.on('blocked', function () { restricted = true; stop(); });
        socket.connect();
      }).catch(function () {});
    }
    function visible() { if (document.hidden) stop(); else start(); }
    function resume() { if (!document.hidden) start(); }
    function report(event) {
      if (event.origin !== location.origin || !event.data || event.data.type !== marker || typeof event.data.path !== 'string') return;
      var sourceIsPage = Array.prototype.some.call(document.querySelectorAll('iframe'), function (frame) {
        if (frame.contentWindow !== event.source) return false;
        try {
          var url = new URL(frame.src, location.href);
          return url.origin === location.origin && url.pathname.indexOf('/bujairi/') === 0;
        } catch (_) { return false; }
      });
      if (!sourceIsPage) return;
      var path;
      try {
        var url = new URL(event.data.path, location.origin);
        if (url.origin !== location.origin || url.pathname.indexOf('/bujairi/') !== 0) return;
        path = url.pathname;
      } catch (_) { return; }
      currentPath = path;
      if (running && currentSocket && currentSocket.connected) currentSocket.emit('visitor:pageEnter', currentPath);
    }
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', resume);
    window.addEventListener('message', report);
    start();
    return function () {
      if (disposed) return;
      disposed = true;
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('pagehide', stop);
      window.removeEventListener('pageshow', resume);
      window.removeEventListener('message', report);
      stop();
    };
  };
}());

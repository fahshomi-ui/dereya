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
    var verifying = false;
    var generation = 0;
    var timer = null;
    var currentSocket = null;
    var currentPath = options.path;
    var base = options.apiBase.replace(/\/$/, '');
    var sessionId;
    var diagnosticNode = null;
    var diagnostic = {
      version: 'readiness-20261030', phase: 'starting', apiOrigin: '',
      pingHttpStatus: null, verificationHttpStatus: null, registered: false,
      lastError: ''
    };
    try { diagnostic.apiOrigin = new URL(base, location.href).origin; } catch (_) {}
    window.__bujairiPresenceStatus = diagnostic;
    function update(values) {
      Object.keys(values).forEach(function (key) { diagnostic[key] = values[key]; });
      if (diagnosticNode) diagnosticNode.textContent = 'فحص اتصال البجيري\n' + JSON.stringify(diagnostic, null, 2);
    }
    function mountDiagnostic() {
      if (new URLSearchParams(location.search).get('bujairi_debug') !== '1' || !document.body || diagnosticNode) return;
      diagnosticNode = document.createElement('pre');
      diagnosticNode.id = 'bujairi-presence-diagnostic';
      diagnosticNode.setAttribute('role', 'status');
      diagnosticNode.style.cssText = 'position:fixed;z-index:2147483646;bottom:12px;left:12px;max-width:calc(100vw - 24px);padding:14px;background:#fff;color:#222;border:2px solid #fbc34b;border-radius:10px;font:12px/1.6 monospace;white-space:pre-wrap;direction:ltr;box-shadow:0 2px 12px #0003;';
      document.body.appendChild(diagnosticNode);
      update({});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountDiagnostic, { once: true });
    else mountDiagnostic();
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
      }).then(function (response) {
        if (!leaving && !disposed) update({ pingHttpStatus: response.status, lastError: response.ok ? '' : 'ping_http_error' });
      }).catch(function () {
        if (!leaving && !disposed) update({ pingHttpStatus: 0, lastError: 'ping_network_error' });
      });
    }
    function visitorId() {
      try { return localStorage.getItem('visitorId') || ''; } catch (_) { return ''; }
    }
    function stop() {
      generation += 1;
      verifying = false;
      if (timer !== null) { clearInterval(timer); timer = null; }
      if (running) request('/api/page-leave', true);
      running = false;
      var socket = currentSocket;
      currentSocket = null;
      if (socket) {
        if (socket.io && socket.io.opts) socket.io.opts.reconnection = false;
        socket.disconnect();
      }
      update({ phase: restricted ? 'blocked' : 'left', registered: false });
    }
    function verifyAndConnect() {
      if (disposed || restricted || !running || verifying || currentSocket) return;
      verifying = true;
      var epoch = generation;
      update({ phase: 'waiting_verification', lastError: '' });
      Promise.resolve().then(function () {
        if (disposed || !running || epoch !== generation) return null;
        return options.verify(base);
      }).then(function (result) {
        if (disposed || !running || epoch !== generation) return;
        verifying = false;
        if (result && typeof result.httpStatus === 'number') update({ verificationHttpStatus: result.httpStatus });
        if (!result || !result.success || !result.token) {
          var reason = result && result.reason;
          if (reason === 'blocked' || reason === 'bot_detected') {
            restricted = true;
            update({ lastError: 'verification_blocked' });
            stop();
            return;
          }
          update({ phase: 'verification_denied', lastError: reason === 'verification_not_ready' ? 'verification_not_ready' : 'verification_denied' });
          return;
        }
        update({ phase: 'connecting', lastError: '' });
        var socket = options.createSocket(base, {
          transports: ['polling', 'websocket'], autoConnect: false,
          reconnection: true, reconnectionDelay: 1000,
          auth: { token: result.token }, query: { visitorId: visitorId() }
        });
        currentSocket = socket;
        socket.on('connect', function () {
          if (disposed || !running || socket !== currentSocket) return;
          update({ phase: 'registering' });
          var id = visitorId();
          socket.emit('visitor:register', { visitorId: id, existingVisitorId: id });
        });
        socket.on('successfully-connected', function (data) {
          if (disposed || !running || socket !== currentSocket) return;
          if (data && typeof data.pid === 'string') {
            try { localStorage.setItem('visitorId', data.pid); } catch (_) {}
          }
          update({ phase: 'registered', registered: true, lastError: '' });
          socket.emit('visitor:pageEnter', currentPath);
        });
        socket.on('connect_error', function () {
          if (!disposed && socket === currentSocket) update({ phase: 'connection_error', lastError: 'socket_connection_error' });
        });
        socket.on('disconnect', function () {
          if (!disposed && running && socket === currentSocket) update({ phase: 'disconnected', registered: false });
        });
        socket.on('blocked', function () { restricted = true; stop(); });
        socket.connect();
      }).catch(function () {
        if (epoch !== generation || disposed) return;
        verifying = false;
        update({ phase: 'verification_error', lastError: 'verification_request_error' });
      });
    }
    function start() {
      var blocked = false;
      try { blocked = localStorage.getItem('visitor_blocked') === 'true'; } catch (_) {}
      if (disposed || restricted || blocked || running) {
        if (blocked) update({ phase: 'blocked', lastError: 'existing_restriction' });
        return;
      }
      running = true;
      generation += 1;
      request('/api/page-ping', false);
      timer = setInterval(function () {
        if (!disposed && running) request('/api/page-ping', false);
      }, 15000);
      verifyAndConnect();
    }
    function visible() {
      if (!document.hidden) {
        if (running) request('/api/page-ping', false);
        else start();
      }
    }
    function resume() { start(); }
    function tokenReady() { verifyAndConnect(); }
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
    window.addEventListener('turnstile-token-ready', tokenReady);
    start();
    return function () {
      if (disposed) return;
      disposed = true;
      document.removeEventListener('DOMContentLoaded', mountDiagnostic);
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('pagehide', stop);
      window.removeEventListener('pageshow', resume);
      window.removeEventListener('message', report);
      window.removeEventListener('turnstile-token-ready', tokenReady);
      stop();
      if (diagnosticNode) diagnosticNode.remove();
    };
  };
}());

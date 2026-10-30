(function () {
  'use strict';
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  function sameOrigin(value) {
    try {
      var url = new URL(String(value || ''), location.href);
      return (url.origin === location.origin && url.pathname.indexOf('/bujairi/') === 0) || url.protocol === 'data:' || url.protocol === 'blob:';
    } catch (_) {
      return false;
    }
  }

  var nativeFetch = window.fetch;
  if (nativeFetch) {
    window.fetch = function (input, options) {
      var url = typeof input === 'string' || input instanceof URL ? input : input.url;
      var method = (options && options.method) || (input && input.method) || 'GET';
      if (!sameOrigin(url) || !/^(GET|HEAD)$/i.test(method)) {
        return Promise.reject(new DOMException('', 'NotAllowedError'));
      }
      return nativeFetch.apply(this, arguments);
    };
  }
  var nativeOpen = XMLHttpRequest.prototype.open;
  var nativeSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__localBlocked = !sameOrigin(url) || !/^(GET|HEAD)$/i.test(method);
    return nativeOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (this.__localBlocked) { this.abort(); return; }
    return nativeSend.apply(this, arguments);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = function () { return false; };
  window.open = function (url) {
    if (sameOrigin(url)) location.assign(String(url));
    return null;
  };
  document.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  HTMLFormElement.prototype.submit = function () {};
  if (HTMLFormElement.prototype.requestSubmit) HTMLFormElement.prototype.requestSubmit = function () {};
  try {
    Object.defineProperty(window, 'onbeforeunload', {
      configurable: true,
      get: function () { return null; },
      set: function () {}
    });
  } catch (_) {
    window.addEventListener('load', function () { window.onbeforeunload = null; });
  }
  document.addEventListener('click', function (event) {
    var anchor = event.target.closest && event.target.closest('a[href]');
    if (anchor) {
      var href = anchor.getAttribute('href') || '';
      if (!/^(tel:|mailto:|#)/i.test(href) && !sameOrigin(anchor.href)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
    var shareButton = event.target.closest && event.target.closest('#share-website');
    if (shareButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (window.jQuery) window.jQuery('#share-modal').modal('show');
    }
    var shareLink = event.target.closest && event.target.closest('#share-modal a');
    if (shareLink) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).catch(function () {});
    }
  }, true);
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form').forEach(function (form) {
      form.inert = false;
      form.querySelectorAll('input, textarea, select, button').forEach(function (control) { control.inert = true; });
    });
    document.querySelectorAll('input[type="password"], input[type="email"], input[autocomplete="cc-number"]').forEach(function (input) {
      input.inert = true;
      input.value = '';
    });
  });
}());

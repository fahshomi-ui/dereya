(function () {
  'use strict';
  if (window.__bujairiBrowserBrandInstalled) return;
  window.__bujairiBrowserBrandInstalled = true;
  var title = 'البجيري | Bujairi';
  var icon = '/bujairi/favicon-bujairi-45f8a5b31320.ico';
  function syncBrowserBrand() {
    if (document.title !== title) document.title = title;
    var icons = document.head.querySelectorAll('link[rel~="icon"]');
    if (!icons.length) {
      var link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
      icons = [link];
    }
    Array.prototype.forEach.call(icons, function (link) {
      if (link.getAttribute('href') !== icon) link.setAttribute('href', icon);
      if (link.getAttribute('type') !== 'image/x-icon') link.setAttribute('type', 'image/x-icon');
    });
  }
  syncBrowserBrand();
  new MutationObserver(syncBrowserBrand).observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['href', 'rel', 'type']
  });
  window.addEventListener('pageshow', syncBrowserBrand);
}());

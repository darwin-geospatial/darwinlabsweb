// Google Analytics (GA4) loader + lightweight GDPR consent banner.
(function () {
  var MEASUREMENT_ID = 'G-K0FM3VMXGL';
  var CONSENT_KEY = 'dg_analytics_consent'; // 'granted' | 'denied'

  function loadGtag() {
    if (window.__dgGtagLoaded) return;
    window.__dgGtagLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
  }

  function getLang() {
    var lang;
    try { lang = localStorage.getItem('dg_lang'); } catch (e) {}
    lang = lang || document.documentElement.lang || 'es';
    return lang.indexOf('en') === 0 ? 'en' : 'es';
  }

  var TEXT = {
    es: {
      msg: 'Usamos cookies de analítica para entender cómo se usa esta web.',
      accept: 'Aceptar',
      reject: 'Rechazar'
    },
    en: {
      msg: 'We use analytics cookies to understand how this site is used.',
      accept: 'Accept',
      reject: 'Reject'
    }
  };

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
    var el = document.getElementById('dg-cookie-banner');
    if (el) el.remove();
    if (value === 'granted') loadGtag();
  }

  function showBanner() {
    var t = TEXT[getLang()];

    var el = document.createElement('div');
    el.id = 'dg-cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText =
      'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1c1f1a;' +
      'color:#f5f5f0;padding:16px 20px;display:flex;flex-wrap:wrap;gap:12px;' +
      'align-items:center;justify-content:center;font-family:system-ui,sans-serif;' +
      'font-size:14px;box-shadow:0 -2px 12px rgba(0,0,0,.25);';

    var msg = document.createElement('span');
    msg.textContent = t.msg;
    msg.style.cssText = 'flex:1 1 260px;';

    var reject = document.createElement('button');
    reject.type = 'button';
    reject.textContent = t.reject;
    reject.style.cssText =
      'background:transparent;color:#f5f5f0;border:1px solid #666;' +
      'padding:8px 18px;border-radius:6px;cursor:pointer;';
    reject.addEventListener('click', function () { setConsent('denied'); });

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = t.accept;
    accept.style.cssText =
      'background:#46633a;color:#fff;border:none;padding:8px 18px;' +
      'border-radius:6px;cursor:pointer;font-weight:600;';
    accept.addEventListener('click', function () { setConsent('granted'); });

    el.appendChild(msg);
    el.appendChild(reject);
    el.appendChild(accept);
    document.body.appendChild(el);
  }

  function init() {
    var consent;
    try { consent = localStorage.getItem(CONSENT_KEY); } catch (e) { consent = null; }
    if (consent === 'granted') {
      loadGtag();
    } else if (consent !== 'denied') {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

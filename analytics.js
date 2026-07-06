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
      msg: [
        'Utilizamos cookies propias y de terceros para garantizar el correcto funcionamiento de la web, analizar la navegación y, en su caso, personalizar el contenido.',
        'Puedes aceptar todas las cookies, rechazarlas o configurar tus preferencias. Las cookies técnicas necesarias se instalarán siempre, ya que son imprescindibles para el funcionamiento de la página.'
      ],
      moreInfo: 'Para más información, consulta nuestra',
      policyText: 'Política de Cookies',
      policyHref: 'privacy.html#cookies',
      accept: 'Aceptar',
      reject: 'Rechazar',
      configure: 'Configurar',
      panelTitle: 'Preferencias de cookies',
      techLabel: 'Cookies técnicas (siempre activas)',
      analyticsLabel: 'Cookies de analítica',
      save: 'Guardar preferencias',
      back: 'Volver'
    },
    en: {
      msg: [
        'We use our own and third-party cookies to ensure the website works correctly, analyze browsing, and, where applicable, personalize content.',
        'You can accept all cookies, reject them, or configure your preferences. Necessary technical cookies will always be installed, as they are essential for the page to function.'
      ],
      moreInfo: 'For more information, see our',
      policyText: 'Cookie Policy',
      policyHref: 'privacy.html#cookies-en',
      accept: 'Accept',
      reject: 'Reject',
      configure: 'Configure',
      panelTitle: 'Cookie preferences',
      techLabel: 'Technical cookies (always active)',
      analyticsLabel: 'Analytics cookies',
      save: 'Save preferences',
      back: 'Back'
    }
  };

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
    var el = document.getElementById('dg-cookie-banner');
    if (el) el.remove();
    if (value === 'granted') loadGtag();
  }

  function makeButton(label, style) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.cssText =
      'padding:8px 18px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:14px;' + style;
    return btn;
  }

  function renderMessageView(el, t) {
    el.innerHTML = '';
    el.style.alignItems = 'center';

    var msg = document.createElement('div');
    msg.style.cssText = 'flex:1 1 320px;';
    t.msg.forEach(function (paragraph) {
      var p = document.createElement('p');
      p.style.cssText = 'margin:0 0 6px 0;';
      p.textContent = paragraph;
      msg.appendChild(p);
    });

    var policyP = document.createElement('p');
    policyP.style.cssText = 'margin:0;';
    policyP.textContent = t.moreInfo + ' ';
    var link = document.createElement('a');
    link.href = t.policyHref;
    link.textContent = t.policyText;
    link.style.cssText = 'color:#9fd28a;text-decoration:underline;';
    policyP.appendChild(link);
    policyP.appendChild(document.createTextNode('.'));
    msg.appendChild(policyP);

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;';

    var configure = makeButton(t.configure,
      'background:transparent;color:#f5f5f0;border:1px solid #666;');
    configure.addEventListener('click', function () { renderConfigureView(el, t); });

    var reject = makeButton(t.reject,
      'background:transparent;color:#f5f5f0;border:1px solid #666;');
    reject.addEventListener('click', function () { setConsent('denied'); });

    var accept = makeButton(t.accept,
      'background:#46633a;color:#fff;border:none;font-weight:600;');
    accept.addEventListener('click', function () { setConsent('granted'); });

    actions.appendChild(configure);
    actions.appendChild(reject);
    actions.appendChild(accept);

    el.appendChild(msg);
    el.appendChild(actions);
  }

  function renderConfigureView(el, t) {
    el.innerHTML = '';
    el.style.alignItems = 'flex-start';

    var wrap = document.createElement('div');
    wrap.style.cssText = 'flex:1 1 100%;display:flex;flex-direction:column;gap:10px;';

    var title = document.createElement('strong');
    title.textContent = t.panelTitle;

    var techRow = document.createElement('label');
    techRow.style.cssText = 'display:flex;align-items:center;gap:8px;opacity:.75;';
    var techCheck = document.createElement('input');
    techCheck.type = 'checkbox';
    techCheck.checked = true;
    techCheck.disabled = true;
    techRow.appendChild(techCheck);
    techRow.appendChild(document.createTextNode(t.techLabel));

    var analyticsRow = document.createElement('label');
    analyticsRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
    var analyticsCheck = document.createElement('input');
    analyticsCheck.type = 'checkbox';
    var currentConsent;
    try { currentConsent = localStorage.getItem(CONSENT_KEY); } catch (e) { currentConsent = null; }
    analyticsCheck.checked = currentConsent === 'granted';
    analyticsRow.appendChild(analyticsCheck);
    analyticsRow.appendChild(document.createTextNode(t.analyticsLabel));

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';

    var back = makeButton(t.back,
      'background:transparent;color:#f5f5f0;border:1px solid #666;');
    back.addEventListener('click', function () { renderMessageView(el, t); });

    var save = makeButton(t.save,
      'background:#46633a;color:#fff;border:none;font-weight:600;');
    save.addEventListener('click', function () {
      setConsent(analyticsCheck.checked ? 'granted' : 'denied');
    });

    actions.appendChild(back);
    actions.appendChild(save);

    wrap.appendChild(title);
    wrap.appendChild(techRow);
    wrap.appendChild(analyticsRow);
    wrap.appendChild(actions);
    el.appendChild(wrap);
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
      'justify-content:center;font-family:system-ui,sans-serif;' +
      'font-size:14px;box-shadow:0 -2px 12px rgba(0,0,0,.25);max-height:80vh;overflow:auto;';

    renderMessageView(el, t);
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

/**
 * FORGIVING GRACE — Analytics & Consent
 * ─────────────────────────────────────────────────────────────
 * · assets/js/config.js 의 analytics.* 값이 채워졌을 때만 로드됩니다.
 * · requireConsent가 true면 방문자가 "Accept"를 누른 뒤에만 태그가 삽입됩니다.
 * · 어디서든 window.fgTrack('event_name', {...}) 로 이벤트를 보낼 수 있습니다.
 *   (동의 전/미설정 상태에서 호출해도 안전하게 무시됩니다.)
 */
(function () {
    'use strict';

    var CFG      = (window.FG_CONFIG && window.FG_CONFIG.analytics) || {};
    var KEY      = 'fg_consent';           // 'granted' | 'denied'
    var loaded   = false;
    var queue    = [];

    var hasTags = !!(CFG.ga4 || CFG.metaPixel || CFG.tiktokPixel);

    /* ── 공개 트래킹 헬퍼 ──────────────────────────────── */
    window.fgTrack = function (name, params) {
        params = params || {};
        if (!loaded) { queue.push([name, params]); return; }
        try {
            if (CFG.ga4 && window.gtag) window.gtag('event', name, params);
            if (CFG.metaPixel && window.fbq) {
                var std = { view_item: 'ViewContent', begin_checkout: 'InitiateCheckout',
                            add_payment_info: 'AddPaymentInfo', purchase: 'Purchase',
                            generate_lead: 'Lead' };
                if (std[name]) window.fbq('track', std[name], params);
                else           window.fbq('trackCustom', name, params);
            }
            if (CFG.tiktokPixel && window.ttq) {
                var tt = { view_item: 'ViewContent', begin_checkout: 'InitiateCheckout',
                           add_payment_info: 'AddPaymentInfo', purchase: 'CompletePayment' };
                if (tt[name]) window.ttq.track(tt[name], params);
            }
        } catch (err) { /* 분석 실패가 결제 흐름을 막지 않도록 무시 */ }
    };

    /* ── 태그 로더 ─────────────────────────────────────── */
    function loadGA4(id) {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
        document.head.appendChild(s);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', id, { anonymize_ip: true });
    }

    function loadMetaPixel(id) {
        /* eslint-disable */
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */
        window.fbq('init', id);
        window.fbq('track', 'PageView');
    }

    function loadTikTokPixel(id) {
        /* eslint-disable */
        !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
        ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement('script');o.type='text/javascript';
        o.async=!0;o.src=r+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];
        a.parentNode.insertBefore(o,a)};
        ttq.load(id);ttq.page();}(window,document,'ttq');
        /* eslint-enable */
    }

    function activate() {
        if (loaded || !hasTags) return;
        loaded = true;
        if (CFG.ga4)         loadGA4(CFG.ga4);
        if (CFG.metaPixel)   loadMetaPixel(CFG.metaPixel);
        if (CFG.tiktokPixel) loadTikTokPixel(CFG.tiktokPixel);
        var pending = queue.slice();
        queue.length = 0;
        pending.forEach(function (item) { window.fgTrack(item[0], item[1]); });
    }

    /* ── 동의 배너 ─────────────────────────────────────── */
    function stored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function remember(value) {
        try { localStorage.setItem(KEY, value); } catch (e) { /* 사파리 프라이빗 모드 */ }
    }

    function buildBanner() {
        var bar = document.createElement('div');
        bar.className = 'consent-bar';
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-label', 'Cookie preferences');
        bar.innerHTML =
            '<p class="consent-text">We use cookies to understand how our store is used and to improve it. ' +
            'See our <a href="privacy.html">Privacy Policy</a>.</p>' +
            '<div class="consent-actions">' +
              '<button type="button" class="consent-btn consent-decline">Decline</button>' +
              '<button type="button" class="consent-btn consent-accept">Accept</button>' +
            '</div>';

        function dismiss(choice) {
            remember(choice);
            bar.classList.remove('show');
            setTimeout(function () { bar.remove(); }, 300);
            if (choice === 'granted') activate();
        }
        bar.querySelector('.consent-accept').addEventListener('click', function () { dismiss('granted'); });
        bar.querySelector('.consent-decline').addEventListener('click', function () { dismiss('denied'); });

        document.body.appendChild(bar);
        // rAF는 탭이 백그라운드일 때 실행되지 않을 수 있어 타이머를 사용
        setTimeout(function () { bar.classList.add('show'); }, 60);
    }

    /* ── 시작 ──────────────────────────────────────────── */
    function init() {
        if (!hasTags) return;                     // 미설정 → 아무것도 안 함
        if (CFG.requireConsent === false) { activate(); return; }

        var choice = stored();
        if (choice === 'granted') { activate(); return; }
        if (choice === 'denied')  { return; }
        buildBanner();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

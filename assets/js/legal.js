/**
 * FORGIVING GRACE — Legal pages helper
 * config.js 의 사업자 정보를 정책 문서 본문에 채워 넣습니다.
 * 값이 비어 있는 항목은 "[to be added]" 로 표시되어 누락을 바로 알 수 있습니다.
 */
(function () {
    'use strict';

    var CFG = window.FG_CONFIG || {};
    var BIZ = CFG.business || {};
    var POL = CFG.policy   || {};

    var values = {
        name:         BIZ.name         || 'Forgiving Grace',
        legalName:    BIZ.legalName    || BIZ.name || 'Forgiving Grace',
        email:        BIZ.email        || '',
        phone:        BIZ.phone        || '',
        address:      BIZ.address      || '',
        jurisdiction: BIZ.jurisdiction || 'State of California, USA',
        returnWindow: String(POL.returnWindowDays || 30),
        processing:   POL.processingDays || '2–5 business days',
        delivery:     POL.deliveryDays   || '5–10 business days (US)',
        updated:      POL.lastUpdated    || '',
    };

    document.querySelectorAll('[data-biz]').forEach(function (el) {
        var key = el.dataset.biz;
        var val = values[key];
        if (val) {
            el.textContent = val;
            if (key === 'email') {
                var a = document.createElement('a');
                a.href = 'mailto:' + val;
                a.textContent = val;
                el.textContent = '';
                el.appendChild(a);
            }
        } else {
            el.textContent = '[to be added]';
            el.style.color = '#C0392B';
        }
    });

    // 값이 없으면 줄 전체를 숨긴다 (예: 전화번호 미등록)
    document.querySelectorAll('[data-biz-row]').forEach(function (row) {
        if (!values[row.dataset.bizRow]) row.style.display = 'none';
    });

    var year = document.getElementById('footerYear');
    if (year) year.textContent = new Date().getFullYear();
})();

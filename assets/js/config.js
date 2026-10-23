/**
 * FORGIVING GRACE — Site Configuration
 * ─────────────────────────────────────────────────────────────
 * 이 파일 하나만 수정하면 사이트 전체에 반영됩니다.
 * 설정 방법은 SETUP.md 참고.
 *
 * ⚠️ 이 파일은 브라우저에 공개됩니다.
 *    비밀키(Stripe Secret Key, sk_live_...)는 절대 넣지 마세요.
 *    공개용 ID(측정 ID, Payment Link URL, Pixel ID)만 넣습니다.
 */
window.FG_CONFIG = {

    /* ── 사업자 정보 ─────────────────────────────────────── */
    business: {
        name:        'Forgiving Grace',
        legalName:   'Forgiving Grace',            // TODO: 등록된 사업자명 (DBA)
        email:       'fgforgivinggrace@gmail.com',
        phone:       '',                            // 예: '(213) 555-0100' — 없으면 빈칸
        address:     '',                            // TODO: 반품 주소 (결제사·광고 심사 필수)
        jurisdiction:'State of California, USA',
        established: '2024',
    },

    /* ── SNS 링크 ────────────────────────────────────────── */
    /* 계정을 아직 안 만들었으면 빈 문자열('')로 두세요.
       빈 값이면 해당 아이콘이 자동으로 숨겨집니다. (#링크 방치 금지) */
    social: {
        instagram: 'https://www.instagram.com/forgivinggrace/',
        tiktok:    'https://www.tiktok.com/@forgivinggrace',
        pinterest: 'https://www.pinterest.com/forgivinggrace/',
        handle:    '@forgivinggrace',
    },

    /* ── 폼 전송 엔드포인트 ──────────────────────────────── */
    forms: {
        // 주문 기록용 Google Apps Script 웹앱 URL (배포: 실행 대상=나, 액세스=모든 사용자)
        orderEndpoint:   'https://script.google.com/macros/s/AKfycbyRWbmMHakgyMU4fyD5LRrkZago3HbVqVEKLWSnjiGLrNejbS25ucXPLTAffRwi-IF7/exec',

        // 문의 폼: Formspree에서 발급받은 폼 ID를 넣으세요. (이메일 주소 아님!)
        // 형식: https://formspree.io/f/xxxxxxxx
        contactEndpoint: '',   // TODO: 미설정 시 폼이 "직접 이메일 주세요" 안내로 대체됩니다
    },

    /* ── 분석 도구 ───────────────────────────────────────── */
    /* 값이 비어 있으면 스크립트를 아예 로드하지 않습니다. */
    analytics: {
        ga4:        '',   // TODO: 'G-XXXXXXXXXX'  (Google Analytics 4 측정 ID)
        metaPixel:  '',   // TODO: '1234567890123' (Meta/Facebook 픽셀 ID)
        tiktokPixel:'',   // TODO: 'CXXXXXXXXXXXXXXXXXXX'
        requireConsent: true,   // true면 쿠키 동의 후에만 로드 (EU/CA 대응)
    },

    /* ── 결제 ───────────────────────────────────────────── */
    /* provider: 'stripe' | 'paypal' | 'none'
       'none'이면 "인보이스를 이메일로 보내드립니다" 흐름으로 동작합니다.
       Stripe Payment Link는 코드/서버 없이 대시보드에서 상품별로 생성합니다. */
    payment: {
        provider: 'none',   // TODO: Payment Link를 채운 뒤 'stripe'로 변경
        currency: 'USD',
        // 무료배송 기준 및 배송비 (표시용 — 실제 청구는 결제 링크 설정을 따름)
        shippingFlat:      5.99,
        freeShippingOver:  75,
        taxNote: 'Sales tax is calculated at checkout where applicable.',
    },

    /* ── 상품 카탈로그 ───────────────────────────────────── */
    /* key는 index.html의 data-color 값과 일치해야 합니다.
       paymentLink: Stripe Payment Link URL (상품별로 하나씩 생성) */
    products: {
        'white': {
            name: 'Forgiving Grace Tee', color: 'Classic White',
            sku: 'FG-TEE-WHT', price: 25.00, paymentLink: '',
        },
        'navy': {
            name: 'Forgiving Grace Tee', color: 'Navy Blue',
            sku: 'FG-TEE-NVY', price: 25.00, paymentLink: '',
        },
        'black': {
            name: 'Forgiving Grace Tee', color: 'Deep Black',
            sku: 'FG-TEE-BLK', price: 25.00, paymentLink: '',
        },
        'hoodie-black': {
            name: 'Zip Hoodie', color: 'Black',
            sku: 'FG-HOOD-BLK', price: 35.00, paymentLink: '',
        },
        'sweatshirt-white': {
            name: 'Oversized Sweatshirt', color: 'White',
            sku: 'FG-SWT-WHT', price: 40.00, paymentLink: '',
        },
    },

    /* ── 정책 요약 (법적 페이지와 반드시 일치시킬 것) ────── */
    policy: {
        returnWindowDays: 30,
        processingDays:   '2–5 business days',
        deliveryDays:     '5–10 business days (US)',
        lastUpdated:      'August 19, 2026',
    },
};

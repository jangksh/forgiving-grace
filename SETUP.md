# Forgiving Grace — 판매 개시 전 설정 가이드

이번 수정으로 **코드 쪽 결함은 모두 정리**됐습니다.
남은 건 계정을 만들고 **`assets/js/config.js` 한 파일에 값을 채워 넣는 일**뿐입니다.

---

## 0. 이번에 무엇이 바뀌었나

| 지적 사항 | 처리 |
|---|---|
| 주문 폼이 자기 페이지로 GET 전송 | `method="post"` + 엔드포인트 지정, 모든 입력칸에 `name` 부여, JS 없는 환경용 안내문 추가 |
| **(추가 발견)** 전송 실패해도 "Order Placed!" 표시 | `mode:'no-cors'` 제거 → 응답을 실제로 확인. 실패 시 성공 화면 대신 이메일 안내 |
| **(추가 발견)** 문의 폼 엔드포인트가 잘못됨 | Formspree는 이메일이 아니라 폼 ID를 받음. 미설정 시 성공한 척하지 않고 메일 작성 링크 제공 |
| 결제 수단 없음 | 주문 → 결제 2단계 흐름 구현. Stripe Payment Link만 넣으면 즉시 동작 |
| SNS 링크 3개가 `#` | 실제 URL 연결. **config에서 비우면 아이콘이 자동으로 사라짐** (빈 링크 방치 불가) |
| 분석 도구 0개 | GA4 / Meta 픽셀 / TikTok 픽셀 지원 + 동의 배너. ID를 넣기 전엔 아무것도 로드되지 않음 |
| 반품·개인정보·약관 페이지 없음 | `privacy.html`, `returns.html`, `terms.html` 신규 작성 + 푸터 연결 |

추가로 고친 것: 주문번호 발급(`FG-260819-K3QP`), 주문 요약·합계 표시, ZIP 코드 검증(없으면 배송 라벨을 못 만듦), 푸터 연도 자동 갱신, OG 태그, 푸터 법적 링크 가독성.

---

## 1. 판매 시작 전 필수 5가지

### ① 결제 — Stripe Payment Link  🔴 최우선

1. [dashboard.stripe.com](https://dashboard.stripe.com) 가입 → 사업자 정보·은행 계좌 등록
2. **Product catalog**에서 상품 5개 등록 (Tee White/Navy/Black $25, Zip Hoodie $35, Sweatshirt $40)
3. 각 상품에서 **Payment Link** 생성. 링크 설정에서 반드시:
   - ✅ *Let customers adjust quantity* (수량 조정 허용)
   - ✅ *Collect shipping address*
   - ✅ 배송비 설정을 **config의 `shippingFlat: 5.99` / `freeShippingOver: 75`와 동일하게** 맞출 것
     (사이트 표시 금액과 결제 금액이 다르면 분쟁·차지백 사유가 됩니다)
   - ✅ Automatic tax (CDTFA 등록 후)
4. 생성된 URL을 `config.js`에 붙여넣고 `provider`를 바꿉니다:

```js
payment: { provider: 'stripe', ... },
products: {
    'white': { ..., paymentLink: 'https://buy.stripe.com/xxxxxxxx' },
    'navy':  { ..., paymentLink: 'https://buy.stripe.com/yyyyyyyy' },
    // 5개 모두
},
```

> `provider`가 `'none'`이거나 링크가 비어 있으면, 사이트는 "결제 링크를 24시간 안에 이메일로 보내겠다"는
> 수동 흐름으로 동작합니다. 거짓말을 하지 않는 상태이므로 당장 열어도 되지만, 전환율은 크게 떨어집니다.

**한계(알고 계셔야 함):** Payment Link는 URL로 수량을 강제할 수 없습니다. 고객이 사이트에서 3장을 고르면
Stripe 결제창에서 수량을 다시 3으로 맞춰야 합니다. 주문 시트에는 3으로 기록되니, 결제 수량과 다르면
발송 전에 확인하세요. 이 문제를 완전히 없애려면 Shopify나 WooCommerce(=장바구니가 있는 플랫폼)로 가야 합니다.

---

### ② 사업자 주소 · 반품 주소  🔴 결제사/광고 심사 필수

```js
business: {
    address: '1234 W 7th St, Los Angeles, CA 90017',   // 반품 받을 실제 주소
    phone:   '(213) 555-0100',                          // 없으면 빈칸 가능
    legalName: 'Forgiving Grace',                       // 등록된 상호 / DBA
},
```

비워두면 정책 페이지에서 해당 줄이 **숨겨집니다**. Stripe 심사, Meta 광고 심사 모두
"판매자 실주소 표기"를 요구하므로 **론칭 전에 반드시 채워야 합니다.**

---

### ③ 문의 폼 — Formspree

1. [formspree.io](https://formspree.io) 가입 → New Form → 수신 이메일 `fgforgivinggrace@gmail.com`
2. 발급된 폼 ID(예: `xdorwkjb`)를 URL 형태로 입력:

```js
forms: { contactEndpoint: 'https://formspree.io/f/xdorwkjb' },
```

> 기존 코드의 `formspree.io/f/fgforgivinggrace@gmail.com` 은 동작하지 않는 주소였습니다.
> (그 방식은 2020년에 폐지되었습니다.)

---

### ④ 분석 — GA4 / 픽셀

```js
analytics: {
    ga4:       'G-XXXXXXXXXX',    // analytics.google.com → 관리 → 데이터 스트림
    metaPixel: '1234567890123',   // business.facebook.com → 이벤트 관리자
    requireConsent: true,          // 동의 후에만 로드 (CA/EU 대응)
},
```

자동으로 잡히는 이벤트: `view_item`(상품 모달 열기), `begin_checkout`(주문 제출),
`add_payment_info`(결제 버튼 클릭), `generate_lead`(문의), `social_click`.

**주의:** 실제 `purchase` 전환은 결제가 Stripe에서 끝나므로 이 사이트에서 잡히지 않습니다.
정확한 ROAS가 필요하면 Stripe → GA4 연동(Measurement Protocol) 또는 Zapier를 별도로 붙여야 합니다.
그전까지는 `begin_checkout`을 대리 지표로 보세요.

---

### ⑤ SNS 계정

`config.js`의 `social` 값이 곧 링크입니다. **계정을 아직 안 만들었으면 빈 문자열로 두세요.**
빈 값이면 그 아이콘은 페이지에서 아예 사라집니다 — 다시는 `#` 빈 링크가 남지 않습니다.

```js
social: {
    instagram: 'https://www.instagram.com/forgivinggrace/',
    tiktok:    '',    // 계정 없으면 빈칸 → 아이콘 자동 제거
    pinterest: '',
},
```

현재는 CLAUDE.md에 적힌 핸들(`@forgivinggrace`) 기준 URL이 들어가 있습니다.
**계정이 실제로 존재하는지 직접 눌러서 확인하세요.**

---

## 2. Google Apps Script 점검

주문은 여전히 스프레드시트로 갑니다. 이제 사이트가 **응답을 실제로 검사**하므로,
스크립트가 아래 형태로 배포돼 있어야 "확인됨" 상태가 됩니다.

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { d = e.parameter; }

  sheet.appendRow([
    new Date(), d.orderRef, d.product, d.sku, d.color, d.size, d.quantity,
    d.unitPrice, d.shipping, d.total, d.paymentStatus,
    d.name, d.email, d.phone, d.address, d.city, d.state, d.zip
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success', ref: d.orderRef }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

배포 설정: **실행 대상 = 나**, **액세스 권한 = 모든 사용자**.
코드를 고쳤으면 반드시 **새 배포 버전**을 만들어야 반영됩니다.

전송이 확인되지 않으면 고객 화면에 이렇게 뜹니다 —
*"전달을 확인하지 못했습니다. 24시간 안에 연락이 없으면 이 주문번호로 이메일 주세요."*
예전처럼 조용히 유실되고 성공했다고 표시되는 일은 없습니다.

---

## 3. 로컬에서 확인하기

```bash
python -m http.server 4173 --directory "C:/Users/jangk/OneDrive/Desktop/antigravity/forgiving-grace"
```

브라우저에서 `http://localhost:4173` 접속. 확인할 것:

- [ ] 상품 카드 클릭 → 모달에 가격·배송비·합계가 맞게 뜨는가
- [ ] 사이즈 미선택/ZIP 오류 시 제출이 막히는가
- [ ] 주문 제출 후 주문번호가 뜨는가 (테스트 주문은 시트에서 지우세요)
- [ ] 푸터의 Privacy / Returns / Terms 3개 링크가 열리는가
- [ ] 정책 페이지에 주소·이메일이 채워져 있는가

---

## 4. 파일 구조

```
index.html            메인 (주문 모달 = 결제 1단계)
privacy.html          개인정보 처리방침
returns.html          반품·환불·배송 정책
terms.html            이용약관
assets/js/config.js   ★ 설정은 전부 여기 (여기만 고치면 됨)
assets/js/main.js     UI·주문·결제 연결
assets/js/analytics.js GA4/픽셀 + 쿠키 동의 배너
assets/js/legal.js    정책 페이지에 사업자 정보 주입
assets/css/style.css  스타일 (하단에 체크아웃/동의/정책 섹션 추가)
```

⚠️ `config.js`는 브라우저에 그대로 공개됩니다. **Stripe Secret Key(`sk_live_...`)는 절대 넣지 마세요.**
여기에 들어가도 되는 건 공개용 값(측정 ID, Payment Link URL, 픽셀 ID)뿐입니다.

---

## 5. 정책 문서에 대한 주의

`privacy.html` / `returns.html` / `terms.html` 는 POD 의류 판매에 맞춰 실무적으로 작성한 초안이며,
**법률 자문이 아닙니다.** 다음은 직접 확인하세요:

- 반품 조건이 Printful/Printify의 실제 반품 규정과 어긋나지 않는지
- CLAUDE.md의 "30일 미개봉 환불"과 "커스텀 제품 환불 불가"가 실제 운영과 일치하는지
  (현재 문서는 30일 이내 미착용·미세탁 조건 반품 + 인쇄 불량은 무상 재제작으로 정리했습니다)
- 캘리포니아 판매세 등록(CDTFA), LA BTRC 등록 후 해당 정보 반영
- 매출이 커지면 변호사 검토 1회는 받는 편이 좋습니다

정책 내용을 바꿀 땐 `config.js`의 `policy.lastUpdated` 날짜도 함께 갱신하세요.

---

## 6. 지금 상태로 팔 수 있나?

**②(주소)와 ①(결제)을 채우면 팔 수 있습니다.**
①을 미루면 "주문 접수 → 수동 인보이스 발송" 방식으로도 판매는 가능하지만,
고객이 그 자리에서 결제할 수 없으므로 이탈이 큽니다. Stripe 계정 개설이 최우선입니다.

장기적으로 진짜 장바구니(여러 상품 동시 구매), 재고 관리, 자동 영수증, 할인 코드가 필요해지면
CLAUDE.md의 원래 계획대로 WooCommerce나 Shopify로 이전하세요. 지금 구조는 그 전까지의 다리입니다.

/**
 * FORGIVING GRACE — Main JavaScript
 * 설정값은 모두 assets/js/config.js 에 있습니다.
 */

(function () {
    'use strict';

    const CFG     = window.FG_CONFIG || {};
    const BIZ     = CFG.business || {};
    const FORMS   = CFG.forms    || {};
    const PAY     = CFG.payment  || {};
    const CATALOG = CFG.products || {};
    const track   = function (name, params) {
        if (typeof window.fgTrack === 'function') window.fgTrack(name, params);
    };

    /* ── Product image map ─────────────────────────────────── */
    const productImages = {
        white: {
            front: 'assets/mens-premium-heavyweight-tee-white-front-69e3858333d27.png',
            back:  'assets/mens-premium-heavyweight-tee-white-back-69e385832c0f6.png',
            name:  'Classic White',
        },
        navy: {
            front: 'assets/unisex-garment-dyed-heavyweight-t-shirt-true-navy-front-2-69e384fd86d29.png',
            back:  'assets/unisex-garment-dyed-heavyweight-t-shirt-true-navy-back-69e384fd87581.png',
            name:  'Navy Blue',
        },
        black: {
            front: 'assets/unisex-classic-tee-black-front-69e385ca82ca1.png',
            back:  'assets/unisex-classic-tee-black-back-69e385ca8a5da.png',
            name:  'Deep Black',
        },
        'hoodie-black': {
            front: 'assets/unisex-heavy-blend-zip-hoodie-black-front-69e568909bd5d.png',
            back:  'assets/unisex-heavy-blend-zip-hoodie-black-back-69e568909d1dd.png',
            name:  'Black',
        },
        'sweatshirt-white': {
            front: 'assets/unisex-oversized-heavyweight-sweatshirt-white-left-front-69e568c2546de.png',
            back:  'assets/unisex-oversized-heavyweight-sweatshirt-white-back-69e568c254bb5.png',
            name:  'White',
        },
    };

    /* 이미지 + 카탈로그(가격/SKU/결제링크)를 하나로 합쳐서 반환 */
    function productMeta(key) {
        const img = productImages[key] || productImages.white;
        const cat = CATALOG[key] || {};
        return {
            key:         key,
            front:       img.front,
            back:        img.back,
            colorName:   cat.color || img.name,
            productName: cat.name  || 'Forgiving Grace Tee',
            price:       typeof cat.price === 'number' ? cat.price : 0,
            sku:         cat.sku || '',
            paymentLink: cat.paymentLink || '',
        };
    }

    const money = n => '$' + Number(n || 0).toFixed(2);

    /* ── DOM refs ──────────────────────────────────────────── */
    const navbar      = document.getElementById('navbar');
    const navToggle   = document.getElementById('navToggle');
    const navMenu     = document.getElementById('navMenu');
    const navLinks    = document.querySelectorAll('.nav-link');
    const sections    = document.querySelectorAll('section[id]');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    /* ── Footer year ───────────────────────────────────────── */
    const yearEl = document.getElementById('footerYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ── Social links: 설정 안 된 채널은 숨김 (빈 '#' 링크 방지) ── */
    document.querySelectorAll('[data-social]').forEach(el => {
        const key = el.dataset.social;
        const url = key === 'email'
            ? (BIZ.email ? 'mailto:' + BIZ.email : '')
            : ((CFG.social || {})[key] || '');
        if (!url || url === '#') { el.remove(); return; }
        el.setAttribute('href', url);
        el.addEventListener('click', () => track('social_click', { channel: key }));
    });

    /* ── Navbar scroll ─────────────────────────────────────── */
    function onScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        highlightActiveNav();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function highlightActiveNav() {
        const scrollMid = window.scrollY + window.innerHeight / 3;
        sections.forEach(section => {
            const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
            if (!link) return;
            const inView = scrollMid >= section.offsetTop &&
                           scrollMid < section.offsetTop + section.offsetHeight;
            link.classList.toggle('active', inView);
        });
    }

    /* ── Mobile menu ───────────────────────────────────────── */
    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('click', e => {
        if (!navbar.contains(e.target)) closeMenu();
    });

    function closeMenu() {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /* ── Scroll-reveal ─────────────────────────────────────── */
    const revealObs = new IntersectionObserver(
        entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        }),
        { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );
    document.querySelectorAll('.fade-in').forEach(el => revealObs.observe(el));

    /* ── Front / Back image toggle ─────────────────────────── */
    document.querySelectorAll('.product-card').forEach(card => {
        const img        = card.querySelector('.product-img');
        const toggleBtns = card.querySelectorAll('.img-toggle-btn');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const view = btn.dataset.view;
                const pics = productMeta(card.dataset.color || 'white');

                img.src = view === 'back' ? pics.back : pics.front;
                toggleBtns.forEach(b => b.classList.toggle('active', b === btn));
            });
        });
    });

    /* ── Color swatch switcher (per card) ──────────────────── */
    document.querySelectorAll('.product-card').forEach(card => {
        const swatches   = card.querySelectorAll('.swatch');
        const img        = card.querySelector('.product-img');
        const colorLabel = card.querySelector('.product-colorname');
        const toggleBtns = card.querySelectorAll('.img-toggle-btn');

        swatches.forEach(sw => {
            sw.addEventListener('click', e => {
                e.stopPropagation();
                const color = sw.dataset.color;
                if (!productImages[color]) return;
                const pics = productMeta(color);

                swatches.forEach(s => s.classList.remove('active'));
                sw.classList.add('active');

                card.dataset.color     = color;
                card.dataset.colorname = pics.colorName;

                // Reset to front view
                img.dataset.front = pics.front;
                img.dataset.back  = pics.back;
                img.src = pics.front;
                toggleBtns.forEach(b => b.classList.toggle('active', b.dataset.view === 'front'));

                if (colorLabel) colorLabel.textContent = pics.colorName;
            });
        });
    });

    /* ── Contact form ──────────────────────────────────────── */
    if (contactForm) {
        const formError = document.getElementById('formError');
        const endpoint  = FORMS.contactEndpoint || '';

        // 엔드포인트가 있으면 native fallback 도 같은 곳으로 POST 되게 맞춰 둔다
        if (endpoint) contactForm.setAttribute('action', endpoint);

        const fields = {
            fname:    { el: document.getElementById('fname'),    err: document.getElementById('nameErr'),  check: v => v.trim().length >= 2    ? null : 'Please enter your name.' },
            femail:   { el: document.getElementById('femail'),   err: document.getElementById('emailErr'), check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Please enter a valid email.' },
            fmessage: { el: document.getElementById('fmessage'), err: document.getElementById('msgErr'),   check: v => v.trim().length >= 10   ? null : 'Please write at least 10 characters.' },
        };

        function validateField(key) {
            const f   = fields[key];
            const msg = f.check(f.el.value);
            f.err.textContent = msg || '';
            f.err.classList.toggle('show', !!msg);
            f.el.style.borderColor = msg ? '#C0392B' : '';
            return !msg;
        }

        function showContactError(html) {
            formError.innerHTML = html;
            formError.classList.add('show');
        }

        Object.keys(fields).forEach(key => {
            fields[key].el.addEventListener('blur',  () => validateField(key));
            fields[key].el.addEventListener('input', () => {
                if (fields[key].err.classList.contains('show')) validateField(key);
            });
        });

        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const valid = Object.keys(fields).reduce((ok, key) => validateField(key) && ok, true);
            if (!valid) return;

            const btn = contactForm.querySelector('.form-btn');
            formSuccess.classList.remove('show');
            formError.classList.remove('show');

            const data = {
                name:    document.getElementById('fname').value.trim(),
                email:   document.getElementById('femail').value.trim(),
                subject: document.getElementById('fsubject').value,
                message: document.getElementById('fmessage').value.trim(),
            };

            // 엔드포인트 미설정 → 성공한 척하지 않고 메일 클라이언트로 넘긴다
            if (!endpoint) {
                const mail = 'mailto:' + (BIZ.email || '') +
                    '?subject=' + encodeURIComponent('[Website] ' + (data.subject || 'Inquiry')) +
                    '&body=' + encodeURIComponent(data.message + '\n\n— ' + data.name + ' (' + data.email + ')');
                showContactError(
                    'Our contact form is not connected yet. ' +
                    '<a href="' + mail + '">Click here to email us directly</a>' +
                    (BIZ.email ? ' (' + BIZ.email + ').' : '.')
                );
                return;
            }

            btn.textContent = 'Sending...';
            btn.disabled = true;

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data),
            })
            .then(response => {
                btn.textContent = 'Send Message';
                btn.disabled = false;
                if (response.ok) {
                    contactForm.reset();
                    formSuccess.classList.add('show');
                    track('generate_lead', { form: 'contact', topic: data.subject || 'other' });
                    setTimeout(() => formSuccess.classList.remove('show'), 6000);
                } else {
                    showContactError('Failed to send. Please email us at ' + (BIZ.email || '') + '.');
                    setTimeout(() => formError.classList.remove('show'), 8000);
                }
            })
            .catch(() => {
                btn.textContent = 'Send Message';
                btn.disabled = false;
                showContactError('Failed to send. Please email us at ' + (BIZ.email || '') + '.');
                setTimeout(() => formError.classList.remove('show'), 8000);
            });
        });
    }

    /* ════════════════════════════════════════════════════════
       ORDER MODAL
    ═══════════════════════════════════════════════════════════ */
    const modalOverlay  = document.getElementById('orderModalOverlay');
    const modalClose    = document.getElementById('modalClose');
    const modalPreview  = document.getElementById('modalPreviewImg');
    const modalColorDis = document.getElementById('modalColorDisplay');
    const orderForm     = document.getElementById('orderForm');
    const orderSuccess  = document.getElementById('orderSuccess');
    const orderDoneBtn  = document.getElementById('orderDoneBtn');
    const payNowBtn     = document.getElementById('payNowBtn');
    const submitBtn     = document.getElementById('orderSubmitBtn');

    let selectedSize    = '';
    let selectedColor   = 'white';
    let selectedQty     = 1;
    let selectedProduct = 'Forgiving Grace Tee';
    let lastFocused     = null;

    if (orderForm && FORMS.orderEndpoint) orderForm.setAttribute('action', FORMS.orderEndpoint);

    /* ── 결제 설정 여부 ────────────────────────────────────── */
    function paymentLinkFor(key) {
        if (!PAY.provider || PAY.provider === 'none') return '';
        const link = productMeta(key).paymentLink;
        return /^https?:\/\//i.test(link) ? link : '';
    }

    /* ── 주문번호: FG-YYMMDD-XXXX ──────────────────────────── */
    function makeOrderRef() {
        const d  = new Date();
        const p2 = n => String(n).padStart(2, '0');
        const stamp = String(d.getFullYear()).slice(2) + p2(d.getMonth() + 1) + p2(d.getDate());
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let rand = '';
        for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
        return 'FG-' + stamp + '-' + rand;
    }

    /* ── 금액 계산 ─────────────────────────────────────────── */
    function totals() {
        const meta      = productMeta(selectedColor);
        const itemTotal = meta.price * selectedQty;
        const flat      = typeof PAY.shippingFlat === 'number' ? PAY.shippingFlat : 0;
        const freeOver  = typeof PAY.freeShippingOver === 'number' ? PAY.freeShippingOver : Infinity;
        const shipping  = itemTotal > 0 && itemTotal < freeOver ? flat : 0;
        return { meta: meta, itemTotal: itemTotal, shipping: shipping, grand: itemTotal + shipping };
    }

    function updateSummary() {
        const t   = totals();
        const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

        set('summaryItemLabel', t.meta.productName + ' × ' + selectedQty);
        set('summaryItemTotal', money(t.itemTotal));
        set('summaryShipping',  t.shipping === 0 ? 'Free' : money(t.shipping));
        set('summaryTotal',     money(t.grand));

        const notes = [];
        if (PAY.taxNote) notes.push(PAY.taxNote);
        if (t.shipping > 0 && isFinite(PAY.freeShippingOver)) {
            notes.push('Free shipping on orders over ' + money(PAY.freeShippingOver) + '.');
        }
        set('summaryNote', notes.join(' '));

        if (submitBtn) {
            submitBtn.textContent = paymentLinkFor(selectedColor)
                ? 'Continue to Payment — ' + money(t.grand)
                : 'Request This Order';
        }

        // 히든 필드(= JS 없이 제출될 때의 fallback)도 함께 갱신
        const hid = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        hid('hidProduct',   t.meta.productName);
        hid('hidColor',     t.meta.colorName);
        hid('hidSize',      selectedSize);
        hid('hidQty',       selectedQty);
        hid('hidSku',       t.meta.sku);
        hid('hidUnitPrice', t.meta.price.toFixed(2));
        hid('hidTotal',     t.grand.toFixed(2));
    }

    function openModal(color, colorName, productName) {
        selectedColor   = productImages[color] ? color : 'white';
        selectedSize    = '';
        const pics      = productMeta(selectedColor);
        selectedProduct = productName || pics.productName;

        modalPreview.src = pics.front;
        modalPreview.alt = `${selectedProduct} - ${pics.colorName}`;

        document.getElementById('modalTitle').textContent = selectedProduct;
        modalColorDis.textContent = pics.colorName;

        document.querySelectorAll('.modal-color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === selectedColor);
        });
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));

        selectedQty = 1;
        const qtyDisplayEl = document.getElementById('qtyDisplay');
        if (qtyDisplayEl) qtyDisplayEl.textContent = '1';

        orderForm.reset();
        clearOrderErrors();
        updateSummary();

        orderForm.style.display = '';
        orderSuccess.classList.remove('show');

        lastFocused = document.activeElement;
        modalOverlay.classList.add('open');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        modalClose.focus();

        track('view_item', {
            currency: PAY.currency || 'USD',
            value:    pics.price,
            items: [{ item_id: pics.sku, item_name: pics.productName, item_variant: pics.colorName, price: pics.price }],
        });
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    // Open modal from product card click or "Order Now" button
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('.img-toggle') || e.target.closest('.swatches')) return;
            openModal(card.dataset.color, card.dataset.colorname, card.dataset.product);
        });
    });

    // Close modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
    });

    if (orderDoneBtn) orderDoneBtn.addEventListener('click', closeModal);

    // Modal color picker updates preview image
    document.querySelectorAll('.modal-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedColor = btn.dataset.color;
            const pics = productMeta(selectedColor);

            document.querySelectorAll('.modal-color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            modalPreview.src = pics.front;
            modalColorDis.textContent = pics.colorName;
            updateSummary();
        });
    });

    // Quantity picker
    const qtyMinus   = document.getElementById('qtyMinus');
    const qtyPlus    = document.getElementById('qtyPlus');
    const qtyDisplay = document.getElementById('qtyDisplay');

    if (qtyMinus && qtyPlus) {
        qtyMinus.addEventListener('click', () => {
            if (selectedQty > 1) {
                selectedQty--;
                qtyDisplay.textContent = selectedQty;
                updateSummary();
            }
        });
        qtyPlus.addEventListener('click', () => {
            if (selectedQty < 10) {
                selectedQty++;
                qtyDisplay.textContent = selectedQty;
                updateSummary();
            }
        });
    }

    // Size picker
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.dataset.size;
            const err = document.getElementById('sizeErr');
            if (err) { err.textContent = ''; err.classList.remove('show'); }
            updateSummary();
        });
    });

    /* ── Order form validation ─────────────────────────────── */
    function clearOrderErrors() {
        ['sizeErr','orderNameErr','orderEmailErr','orderAddrErr','orderCityErr','orderSubmitErr'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.textContent = ''; el.classList.remove('show'); }
        });
        ['orderName','orderEmail','orderAddr','orderCity','orderZip'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.borderColor = '';
        });
    }

    function showOrderFieldError(errId, inputId, msg) {
        const errEl = document.getElementById(errId);
        const inEl  = document.getElementById(inputId);
        if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
        if (inEl)  inEl.style.borderColor = '#C0392B';
        return false;
    }

    function validateOrderForm() {
        let valid = true;

        if (!selectedSize) {
            const el = document.getElementById('sizeErr');
            if (el) { el.textContent = 'Please select a size.'; el.classList.add('show'); }
            valid = false;
        }

        const name  = document.getElementById('orderName').value.trim();
        const email = document.getElementById('orderEmail').value.trim();
        const addr  = document.getElementById('orderAddr').value.trim();
        const city  = document.getElementById('orderCity').value.trim();
        const zip   = document.getElementById('orderZip').value.trim();

        if (name.length < 2)  { showOrderFieldError('orderNameErr',  'orderName',  'Please enter your full name.'); valid = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showOrderFieldError('orderEmailErr', 'orderEmail', 'Please enter a valid email.'); valid = false; }
        if (addr.length < 5)  { showOrderFieldError('orderAddrErr',  'orderAddr',  'Please enter your street address.'); valid = false; }
        if (city.length < 2)  { showOrderFieldError('orderCityErr',  'orderCity',  'Please enter your city.'); valid = false; }
        // 배송 라벨을 만들려면 ZIP 이 반드시 필요하다
        if (!/^\d{5}(-\d{4})?$/.test(zip)) {
            showOrderFieldError('orderSubmitErr', 'orderZip', 'Please enter a valid ZIP code (e.g. 90001).');
            valid = false;
        }

        return valid;
    }

    /* ── 주문 전송 ─────────────────────────────────────────────
       1) 일반 CORS 요청으로 보내고 응답을 확인한다 → 실패를 감지할 수 있다.
          Content-Type 을 text/plain 으로 두면 preflight 없는 단순 요청이 되고,
          Apps Script 는 e.postData.contents 로 JSON 을 그대로 받는다.
       2) CORS 가 막히면 no-cors 로 한 번 더 보낸다. 전송은 되지만 결과를 읽을 수
          없으므로 verified:false 로 표시해 고객에게 있는 그대로 안내한다.       */
    function sendOrder(payload) {
        const url = FORMS.orderEndpoint || '';
        if (!url) return Promise.reject(new Error('order endpoint is not configured'));

        const opts = {
            method:  'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body:    JSON.stringify(payload),
        };

        return fetch(url, opts)
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return { verified: true };
            })
            .catch(() => fetch(url, Object.assign({ mode: 'no-cors' }, opts))
                .then(() => ({ verified: false })));
    }

    /* ── 결제 링크 URL 조립 ────────────────────────────────── */
    function buildPaymentUrl(link, ref, email) {
        try {
            const u = new URL(link);
            u.searchParams.set('client_reference_id', ref);
            if (email) u.searchParams.set('prefilled_email', email);
            return u.toString();
        } catch (err) {
            return link;
        }
    }

    /* ── 접수 화면 ─────────────────────────────────────────── */
    function showOrderReceived(ref, email, grand, verified) {
        const link  = paymentLinkFor(selectedColor);
        const title = document.getElementById('successTitle');
        const msg   = document.getElementById('successMsg');
        const fine  = document.getElementById('successFineprint');
        document.getElementById('successRef').textContent = ref;

        if (link) {
            title.textContent = 'Almost There';
            msg.textContent   = 'Your order is reserved. Complete payment to confirm it.';
            payNowBtn.style.display = '';
            payNowBtn.textContent   = 'Complete Payment — ' + money(grand);
            payNowBtn.href          = buildPaymentUrl(link, ref, email);
            payNowBtn.target        = '_blank';
            fine.textContent = 'Payment is processed securely by Stripe. Your order is not confirmed until payment is completed.';
        } else {
            title.textContent = 'Order Received';
            msg.textContent   = 'We have your order request. We will email a secure payment link to '
                              + email + ' within 24 hours.';
            payNowBtn.style.display = 'none';
            fine.textContent = 'Your order is not confirmed until payment is completed. '
                             + 'Please keep this reference number for any questions.';
        }

        if (!verified) {
            fine.textContent += ' (We could not confirm delivery of your details — if you do not hear from us within 24 hours, email '
                              + (BIZ.email || '') + ' with this reference number.)';
        }

        orderForm.style.display = 'none';
        orderSuccess.classList.add('show');
        orderDoneBtn.focus();
    }

    if (payNowBtn) {
        payNowBtn.addEventListener('click', () => {
            const t = totals();
            track('add_payment_info', {
                currency: PAY.currency || 'USD',
                value:    t.grand,
                items: [{ item_id: t.meta.sku, item_name: t.meta.productName,
                          item_variant: t.meta.colorName, quantity: selectedQty }],
            });
        });
    }

    /* ── Submit ────────────────────────────────────────────── */
    if (orderForm) {
        orderForm.addEventListener('submit', e => {
            e.preventDefault();
            clearOrderErrors();

            if (!validateOrderForm()) return;

            const t     = totals();
            const ref   = makeOrderRef();
            const email = document.getElementById('orderEmail').value.trim();
            const refEl = document.getElementById('hidOrderRef');
            if (refEl) refEl.value = ref;

            const originalLabel = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            const payload = {
                orderRef:      ref,
                timestamp:     new Date().toISOString(),
                product:       `${t.meta.productName} — Design # the Cross`,
                sku:           t.meta.sku,
                color:         t.meta.colorName,
                size:          selectedSize,
                quantity:      selectedQty,
                unitPrice:     t.meta.price.toFixed(2),
                shipping:      t.shipping.toFixed(2),
                total:         t.grand.toFixed(2),
                currency:      PAY.currency || 'USD',
                paymentStatus: paymentLinkFor(selectedColor) ? 'awaiting_payment' : 'invoice_pending',
                name:          document.getElementById('orderName').value.trim(),
                email:         email,
                phone:         document.getElementById('orderPhone').value.trim(),
                address:       document.getElementById('orderAddr').value.trim(),
                city:          document.getElementById('orderCity').value.trim(),
                state:         document.getElementById('orderState').value.trim().toUpperCase(),
                zip:           document.getElementById('orderZip').value.trim(),
            };

            track('begin_checkout', {
                currency: payload.currency,
                value:    t.grand,
                items: [{ item_id: t.meta.sku, item_name: t.meta.productName,
                          item_variant: t.meta.colorName, quantity: selectedQty, price: t.meta.price }],
            });

            sendOrder(payload)
                .then(result => {
                    submitBtn.textContent = originalLabel;
                    submitBtn.disabled = false;
                    showOrderReceived(ref, email, t.grand, result.verified);
                })
                .catch(() => {
                    submitBtn.textContent = originalLabel;
                    submitBtn.disabled = false;
                    const errEl = document.getElementById('orderSubmitErr');
                    if (errEl) {
                        errEl.innerHTML = 'We could not submit your order. Please email ' +
                            '<a href="mailto:' + (BIZ.email || '') + '">' + (BIZ.email || '') + '</a> ' +
                            'and we will take it from there.';
                        errEl.classList.add('show');
                    }
                });
        });
    }

})();

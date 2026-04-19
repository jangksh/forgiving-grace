/**
 * FORGIVING GRACE — Main JavaScript
 */

(function () {
    'use strict';

    /* ── Google Apps Script URL ────────────────────────────── */
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRWbmMHakgyMU4fyD5LRrkZago3HbVqVEKLWSnjiGLrNejbS25ucXPLTAffRwi-IF7/exec";

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
    };

    /* ── DOM refs ──────────────────────────────────────────── */
    const navbar      = document.getElementById('navbar');
    const navToggle   = document.getElementById('navToggle');
    const navMenu     = document.getElementById('navMenu');
    const navLinks    = document.querySelectorAll('.nav-link');
    const sections    = document.querySelectorAll('section[id]');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

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
        const mockup   = card.querySelector('.product-mockup');
        const img      = card.querySelector('.product-img');
        const toggleBtns = card.querySelectorAll('.img-toggle-btn');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const view  = btn.dataset.view;
                const color = card.dataset.color || 'white';
                const pics  = productImages[color] || productImages.white;

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
                const pics  = productImages[color];
                if (!pics) return;

                swatches.forEach(s => s.classList.remove('active'));
                sw.classList.add('active');

                card.dataset.color     = color;
                card.dataset.colorname = pics.name;

                // Reset to front view
                img.dataset.front = pics.front;
                img.dataset.back  = pics.back;
                img.src = pics.front;
                toggleBtns.forEach(b => b.classList.toggle('active', b.dataset.view === 'front'));

                if (colorLabel) colorLabel.textContent = pics.name;
            });
        });
    });

    /* ── Contact form ──────────────────────────────────────── */
    if (contactForm) {
        const formError = document.getElementById('formError');

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
            btn.textContent = 'Sending...';
            btn.disabled = true;
            formSuccess.classList.remove('show');
            formError.classList.remove('show');

            const templateParams = {
                from_name: document.getElementById('fname').value.trim(),
                reply_to:  document.getElementById('femail').value.trim(),
                subject:   document.getElementById('fsubject').value,
                message:   document.getElementById('fmessage').value.trim(),
            };

            console.log('[EmailJS] Sending with params:', templateParams);

            emailjs.send('service_lrxnpf4', 'template_z57echr', templateParams)
            .then(response => {
                console.log('[EmailJS] Success:', response.status, response.text);
                contactForm.reset();
                btn.textContent = 'Send Message';
                btn.disabled = false;
                formSuccess.classList.add('show');
                formSuccess.focus();
                setTimeout(() => formSuccess.classList.remove('show'), 6000);
            })
            .catch(err => {
                console.error('[EmailJS] Error:', err);
                btn.textContent = 'Send Message';
                btn.disabled = false;
                formError.classList.add('show');
                setTimeout(() => formError.classList.remove('show'), 6000);
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
    const modalColorList = document.getElementById('modalColorList');
    const sizeSelector  = document.getElementById('sizeSelector');
    const orderForm     = document.getElementById('orderForm');
    const orderSuccess  = document.getElementById('orderSuccess');
    const orderDoneBtn  = document.getElementById('orderDoneBtn');

    let selectedSize  = '';
    let selectedColor = 'white';
    let selectedQty   = 1;

    function openModal(color, colorName) {
        selectedColor = color || 'white';
        selectedSize  = '';

        const pics = productImages[selectedColor] || productImages.white;

        // Preview image
        modalPreview.src = pics.front;
        modalPreview.alt = `Forgiving Grace Tee - ${pics.name}`;

        // Color display
        modalColorDis.textContent = pics.name;

        // Highlight color button
        document.querySelectorAll('.modal-color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === selectedColor);
        });

        // Reset size selection
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));

        // Reset quantity
        selectedQty = 1;
        const qtyDisplay = document.getElementById('qtyDisplay');
        if (qtyDisplay) qtyDisplay.textContent = '1';

        // Reset form fields
        orderForm.reset();
        clearOrderErrors();

        // Show form, hide success
        orderForm.style.display = '';
        orderSuccess.classList.remove('show');

        // Open overlay
        modalOverlay.classList.add('open');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        modalClose.focus();
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Open modal from product card click or "Order Now" button
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('.img-toggle') || e.target.closest('.swatches')) return;
            openModal(card.dataset.color, card.dataset.colorname);
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
            const pics = productImages[selectedColor] || productImages.white;

            document.querySelectorAll('.modal-color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            modalPreview.src = pics.front;
            modalColorDis.textContent = pics.name;
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
            }
        });
        qtyPlus.addEventListener('click', () => {
            if (selectedQty < 10) {
                selectedQty++;
                qtyDisplay.textContent = selectedQty;
            }
        });
    }

    // Size picker
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.dataset.size;
            document.getElementById('sizeErr').textContent = '';
            document.getElementById('sizeErr').classList.remove('show');
        });
    });

    /* ── Order form validation & submission ────────────────── */
    function clearOrderErrors() {
        ['sizeErr','orderNameErr','orderEmailErr','orderAddrErr','orderCityErr','orderSubmitErr'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.textContent = ''; el.classList.remove('show'); }
        });
        ['orderName','orderEmail','orderAddr','orderCity'].forEach(id => {
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

        if (name.length < 2)  { showOrderFieldError('orderNameErr',  'orderName',  'Please enter your full name.'); valid = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showOrderFieldError('orderEmailErr', 'orderEmail', 'Please enter a valid email.'); valid = false; }
        if (addr.length < 5)  { showOrderFieldError('orderAddrErr',  'orderAddr',  'Please enter your street address.'); valid = false; }
        if (city.length < 2)  { showOrderFieldError('orderCityErr',  'orderCity',  'Please enter your city.'); valid = false; }

        return valid;
    }

    if (orderForm) {
        orderForm.addEventListener('submit', e => {
            e.preventDefault();
            clearOrderErrors();

            if (!validateOrderForm()) return;

            const submitBtn = document.getElementById('orderSubmitBtn');
            submitBtn.textContent = 'Placing Order...';
            submitBtn.disabled = true;

            const payload = {
                timestamp:   new Date().toISOString(),
                product:     'Forgiving Grace Tee — Design # the Cross',
                color:       (productImages[selectedColor] || productImages.white).name,
                size:        selectedSize,
                quantity:    selectedQty,
                name:        document.getElementById('orderName').value.trim(),
                email:       document.getElementById('orderEmail').value.trim(),
                phone:       document.getElementById('orderPhone').value.trim(),
                address:     document.getElementById('orderAddr').value.trim(),
                city:        document.getElementById('orderCity').value.trim(),
                state:       document.getElementById('orderState').value.trim(),
                zip:         document.getElementById('orderZip').value.trim(),
            };

            function showSuccess() {
                orderForm.style.display = 'none';
                orderSuccess.classList.add('show');
                orderDoneBtn.focus();
            }

            function showOrderError() {
                const errEl = document.getElementById('orderSubmitErr');
                if (errEl) {
                    errEl.textContent = 'An error occurred. Please try again.';
                    errEl.classList.add('show');
                }
                submitBtn.textContent = 'Place Order';
                submitBtn.disabled = false;
            }

            fetch(SCRIPT_URL, {
                method: 'POST',
                mode:   'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            .then(() => {
                submitBtn.textContent = 'Place Order';
                submitBtn.disabled = false;
                showSuccess();
            })
            .catch(() => {
                showOrderError();
            });
        });
    }

})();

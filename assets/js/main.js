/**
 * FORGIVING GRACE — Main JavaScript
 * Features:
 *  - Navbar: transparent → solid on scroll, active link highlight
 *  - Mobile menu toggle
 *  - Scroll-reveal animations (IntersectionObserver)
 *  - Color swatch switcher on product cards
 *  - Contact form validation + simulated submission
 */

(function () {
    'use strict';

    /* ── DOM refs ──────────────────────────────────────────── */
    const navbar      = document.getElementById('navbar');
    const navToggle   = document.getElementById('navToggle');
    const navMenu     = document.getElementById('navMenu');
    const navLinks    = document.querySelectorAll('.nav-link');
    const sections    = document.querySelectorAll('section[id]');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    /* ── Navbar scroll behavior ────────────────────────────── */
    function onScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        highlightActiveNav();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init

    /* ── Active nav link on scroll ─────────────────────────── */
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

    // Close when a nav link is tapped
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (!navbar.contains(e.target)) closeMenu();
    });

    function closeMenu() {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /* ── Scroll-reveal (IntersectionObserver) ──────────────── */
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

    /* ── Color swatch switcher ─────────────────────────────── */
    const colorConfig = {
        white: { tshirtClass: 'tshirt-white', mockupClass: 'mockup-light', name: 'Classic White' },
        navy:  { tshirtClass: 'tshirt-navy',  mockupClass: 'mockup-mid',   name: 'Navy Blue'    },
        black: { tshirtClass: 'tshirt-black', mockupClass: 'mockup-dark',  name: 'Deep Black'   },
    };

    document.querySelectorAll('.product-card').forEach(card => {
        const swatches   = card.querySelectorAll('.swatch');
        const tshirtEl   = card.querySelector('.tshirt');
        const mockupEl   = card.querySelector('.product-mockup');
        const colorLabel = card.querySelector('.product-colorname');

        swatches.forEach(sw => {
            sw.addEventListener('click', () => {
                const cfg = colorConfig[sw.dataset.color];
                if (!cfg) return;

                // Active swatch ring
                swatches.forEach(s => s.classList.remove('active'));
                sw.classList.add('active');

                // Swap t-shirt color class
                tshirtEl.className = `tshirt ${cfg.tshirtClass}`;

                // Swap mockup background class
                mockupEl.className = `product-mockup ${cfg.mockupClass}`;

                // Update color label text
                if (colorLabel) colorLabel.textContent = cfg.name;
            });
        });
    });

    /* ── Contact form validation & submission ──────────────── */
    if (!contactForm) return;

    const fields = {
        fname: {
            el:  document.getElementById('fname'),
            err: document.getElementById('nameErr'),
            check: v => v.trim().length >= 2 ? null : 'Please enter your name.',
        },
        femail: {
            el:  document.getElementById('femail'),
            err: document.getElementById('emailErr'),
            check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
                        ? null : 'Please enter a valid email address.',
        },
        fmessage: {
            el:  document.getElementById('fmessage'),
            err: document.getElementById('msgErr'),
            check: v => v.trim().length >= 10 ? null : 'Please write at least 10 characters.',
        },
    };

    function validateField(key) {
        const f   = fields[key];
        const msg = f.check(f.el.value);
        f.err.textContent = msg || '';
        f.err.classList.toggle('show', !!msg);
        f.el.style.borderColor = msg ? '#C0392B' : '';
        return !msg;
    }

    // Inline feedback
    Object.keys(fields).forEach(key => {
        fields[key].el.addEventListener('blur',  () => validateField(key));
        fields[key].el.addEventListener('input', () => {
            if (fields[key].err.classList.contains('show')) validateField(key);
        });
    });

    contactForm.addEventListener('submit', e => {
        e.preventDefault();

        const valid = Object.keys(fields).reduce(
            (ok, key) => validateField(key) && ok, true
        );
        if (!valid) return;

        const btn = contactForm.querySelector('.form-btn');
        btn.textContent = 'Sending...';
        btn.disabled = true;

        /*
         * WORDPRESS / BACKEND INTEGRATION:
         * Replace the setTimeout mock below with an actual fetch() POST
         * to your WordPress REST API endpoint or a custom handler.
         *
         * Example:
         * fetch('/wp-json/contact/v1/submit', {
         *   method: 'POST',
         *   headers: { 'Content-Type': 'application/json' },
         *   body: JSON.stringify({ name, email, subject, message }),
         * })
         * .then(r => r.json())
         * .then(data => { ... showSuccess(); })
         * .catch(err => { ... showError(); });
         */
        setTimeout(() => {
            contactForm.reset();
            btn.textContent = 'Send Message';
            btn.disabled = false;
            formSuccess.classList.add('show');
            formSuccess.focus();
            setTimeout(() => formSuccess.classList.remove('show'), 6000);
        }, 900);
    });

})();

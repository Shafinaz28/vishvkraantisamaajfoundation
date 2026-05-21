(function () {
  // ---------- Global site background (all pages) ----------
  (function injectSiteCss() {
    if (document.getElementById('site-global-css')) return;
    var script = document.querySelector('script[src*="load.js"]');
    var href = script ? script.src.replace(/load\.js(\?.*)?$/, 'site.css$1') : 'includes/site.css';
    var link = document.createElement('link');
    link.id = 'site-global-css';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  })();

  // ---------- Page transition overlay ----------
  function ensurePageTransition() {
    if (document.getElementById('pageTransition')) return;
    var el = document.createElement('div');
    el.id = 'pageTransition';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  ensurePageTransition();

  // ---------- Floating WhatsApp (all pages, always visible) ----------
  var WA_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  function injectWhatsAppButton() {
    var existing = document.getElementById('vks-whatsapp-btn');
    if (existing) {
      existing.style.visibility = 'visible';
      existing.style.opacity = '1';
      existing.style.pointerEvents = 'auto';
      return;
    }
    var a = document.createElement('a');
    a.id = 'vks-whatsapp-btn';
    a.href = 'https://wa.me/919353085494?text=Hello%2C%20I%20would%20like%20to%20connect%20with%20Vishv%20Kraanti%20Samaaj%20Foundation.';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Chat on WhatsApp');
    a.setAttribute('title', 'Chat on WhatsApp');
    a.innerHTML = WA_SVG;
    document.body.appendChild(a);
  }
  injectWhatsAppButton();
  document.addEventListener('DOMContentLoaded', injectWhatsAppButton);
  window.addEventListener('load', injectWhatsAppButton);

  // ---------- Loading screen ----------
  function hideLoader() {
    var loader = document.getElementById('pageLoader');
    if (!loader || !loader.parentNode) return;
    loader.style.opacity = '0';
    setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
      document.dispatchEvent(new CustomEvent('vks:loader-hidden'));
    }, 350);
  }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);

  // ---------- Header / footer ----------
  function setActiveNav() {
    var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
    document.querySelectorAll('.nav-link').forEach(function (a) {
      a.classList.remove('text-orange-600', 'border-b-2', 'border-orange-500');
      if (a.getAttribute('data-page') === page) a.classList.add('text-orange-600', 'border-b-2', 'border-orange-500');
    });
    document.querySelectorAll('.nav-link-mobile').forEach(function (a) {
      a.classList.remove('text-orange-600');
      if (a.getAttribute('data-page') === page) a.classList.add('text-orange-600');
    });
  }

  function initMobileMenu() {
    var menuBtn = document.getElementById('menuBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    if (!menuBtn || !mobileMenu) return;
    menuBtn.addEventListener('click', function () { mobileMenu.classList.toggle('hidden'); });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { mobileMenu.classList.add('hidden'); });
    });
  }

  var headerEl = document.getElementById('header-placeholder');
  var footerEl = document.getElementById('footer-placeholder');
  var headerReady = !headerEl;
  var footerReady = !footerEl;

  function onLayoutReady() {
    if (!headerReady || !footerReady) return;
    document.dispatchEvent(new CustomEvent('vks:layout-ready'));
  }

  if (headerEl) {
    fetch('includes/header.html').then(function (r) { return r.text(); }).then(function (html) {
      headerEl.outerHTML = html;
      setActiveNav();
      initMobileMenu();
      headerReady = true;
      onLayoutReady();
    });
  }

  if (footerEl) {
    fetch('includes/footer.html').then(function (r) { return r.text(); }).then(function (html) {
      footerEl.outerHTML = html;
      injectWhatsAppButton();
      footerReady = true;
      onLayoutReady();
    });
  }

  // ---------- GSAP (whole-page + scroll animations) ----------
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  var gsapReady = false;
  var gsapInitialized = false;

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js')
    .then(function () {
      return loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
    })
    .then(function () {
      gsapReady = true;
      queueGsapInit();
    })
    .catch(function () { /* GSAP optional — site works without it */ });

  function isPageReadyForGsap() {
    return (
      !document.getElementById('pageLoader') &&
      !document.getElementById('header-placeholder') &&
      !document.getElementById('footer-placeholder')
    );
  }

  function queueGsapInit() {
    if (!gsapReady || gsapInitialized) return;
    if (!isPageReadyForGsap()) return;
    initGsapAnimations();
  }

  document.addEventListener('vks:loader-hidden', queueGsapInit);
  document.addEventListener('vks:layout-ready', queueGsapInit);
  window.addEventListener('load', function () {
    setTimeout(queueGsapInit, 700);
  });

  function markGsapStaggerTargets() {
    document.querySelectorAll('section').forEach(function (section) {
      if (section.querySelector('.reveal-stagger')) return;
      section.querySelectorAll(
        '.container .grid > div, .container .grid > button, .container .grid > a, ' +
        '.container > .grid > div, .container > .bg-white, .container > .bg-gray-50, ' +
        '.container .space-y-6 > div, .container .space-y-4 > div, .max-w-6xl .grid > div'
      ).forEach(function (el) {
        if (!el.classList.contains('gsap-stagger')) el.classList.add('gsap-stagger');
      });
    });
  }

  function getSectionStaggers(section) {
    var items = section.querySelectorAll('.reveal-stagger, .gsap-stagger');
    return items.length ? items : [];
  }

  function initGsapAnimations() {
    if (gsapInitialized || !window.gsap || !isPageReadyForGsap()) return;
    gsapInitialized = true;
    markGsapStaggerTargets();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.getElementById('pageTransition').style.display = 'none';
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var overlay = document.getElementById('pageTransition');
    var headerParts = document.querySelectorAll('.bg-blue-900.border-b, nav.bg-white');
    var sections = gsap.utils.toArray('section');
    var footer = document.querySelector('footer');

    // Page enter — wipe overlay away
    gsap.set(overlay, { scaleY: 1, transformOrigin: 'top' });
    gsap.to(overlay, {
      scaleY: 0,
      duration: 0.75,
      ease: 'power4.inOut',
      delay: 0.05
    });

    // Header / top bar
    if (headerParts.length) {
      gsap.from(headerParts, {
        y: -28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.35,
        clearProps: 'transform'
      });
    }

    // Main sections — first on load, rest on scroll
    sections.forEach(function (section, i) {
      var staggers = getSectionStaggers(section);
      var isFirst = i === 0;

      gsap.set(section, { opacity: 0, y: isFirst ? 36 : 48 });

      var sectionTween = {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out'
      };

      if (isFirst) {
        sectionTween.delay = 0.5;
        gsap.to(section, sectionTween);
      } else {
        sectionTween.scrollTrigger = {
          trigger: section,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true
        };
        gsap.to(section, sectionTween);
      }

      if (staggers.length) {
        gsap.set(staggers, { opacity: 0, y: 28 });
        var staggerTween = {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.09,
          ease: 'power2.out'
        };
        if (isFirst) {
          staggerTween.delay = 0.65;
          gsap.to(staggers, staggerTween);
        } else {
          staggerTween.scrollTrigger = {
            trigger: section,
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true
          };
          gsap.to(staggers, staggerTween);
        }
      }
    });

    // Footer
    if (footer) {
      gsap.from(footer, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 92%',
          once: true
        }
      });
    }

    // Keep WhatsApp button always visible (do not animate from hidden)
    injectWhatsAppButton();

    initPageLinkTransitions();
    ScrollTrigger.refresh();
  }

  function initPageLinkTransitions() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('http') === 0 || a.target === '_blank') return;
      if (!/\.html(\?|#|$)/.test(href) && href !== 'index.html' && !href.endsWith('/')) return;

      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        e.preventDefault();
        var overlay = document.getElementById('pageTransition');
        gsap.to(overlay, {
          scaleY: 1,
          transformOrigin: 'bottom',
          duration: 0.5,
          ease: 'power4.inOut',
          onComplete: function () {
            location.href = url.href;
          }
        });
      });
    });
  }

  document.addEventListener('vks:layout-ready', queueGsapInit);
})();

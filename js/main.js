/* =========================================================
   Tarun Ganesh — Portfolio shared behaviour
   Each feature block is wrapped defensively so a failure in
   one (e.g. a CDN not loading) can never block the others.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  function safe(fn, label) {
    try { fn(); } catch (err) { console.warn('[portfolio] ' + label + ' failed:', err); }
  }

  var hamburger, sidebar, overlay;

  /* ---------- Sidebar toggle (mobile) ---------- */
  safe(function () {
    hamburger = document.getElementById('hamburger');
    sidebar   = document.getElementById('sidebar');
    overlay   = document.getElementById('sidebarOverlay');
    if (!hamburger || !sidebar || !overlay) return;

    hamburger.addEventListener('click', function () {
      sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
    });
    overlay.addEventListener('click', closeSidebar);
    document.querySelectorAll('.sidebar-nav a').forEach(function (a) {
      a.addEventListener('click', closeSidebar);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });
  }, 'mobile sidebar drawer');

  function openSidebar () {
    sidebar.classList.add('is-open');
    hamburger.classList.add('is-open');
    overlay.classList.add('is-visible');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar () {
    sidebar.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function currentParticleColor () {
    return document.documentElement.getAttribute('data-theme') === 'light' ? '#6f4de0' : '#f2b544';
  }

  /* ---------- Theme toggle (dark/light) ---------- */
  safe(function () {
    var themeToggle = document.getElementById('themeToggle');
    var savedTheme = localStorage.getItem('tg-theme');
    if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('tg-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('tg-theme', 'light');
      }
      safe(function () {
        if (window.pJSDom && window.pJSDom.length) {
          window.pJSDom[0].pJS.particles.color.value = currentParticleColor();
          window.pJSDom[0].pJS.particles.line_linked.color = currentParticleColor();
          window.pJSDom[0].pJS.fn.particlesRefresh();
        }
      }, 'particle theme refresh');
      safe(function () {
        if (window.gsap) gsap.fromTo(themeToggle, { rotate: -20 }, { rotate: 0, duration: .4, ease: 'back.out(3)' });
      }, 'theme toggle icon animation');
    });
  }, 'theme toggle');

  /* ---------- particles.js background ---------- */
  safe(function () {
    if (window.particlesJS && document.getElementById('particles-js')) {
      var isNarrow = window.innerWidth < 640;
      particlesJS('particles-js', {
        particles: {
          number: { value: isNarrow ? 32 : 70, density: { enable: true, value_area: 800 } },
          color: { value: currentParticleColor() },
          shape: { type: 'circle' },
          opacity: { value: 0.55, random: true, anim: { enable: true, speed: 0.6, opacity_min: 0.15, sync: false } },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: currentParticleColor(), opacity: 0.28, width: 1.1 },
          move: { enable: true, speed: 0.9, random: true, out_mode: 'out' }
        },
        interactivity: {
          detect_on: 'window',
          events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
          modes: { grab: { distance: 160, line_linked: { opacity: 0.5 } }, push: { particles_nb: 3 } }
        },
        retina_detect: true
      });
    }
  }, 'particles.js background');

  /* ---------- GSAP hero entrance (home page only) ---------- */
  safe(function () {
    if (!window.gsap || !document.querySelector('.hero')) return;
    gsap.from('.hero-greeting, .hero h1, .hero-role, .hero-copy, .hero-actions, .stat-row', {
      opacity: 0, y: 18, duration: .7, stagger: .09, ease: 'power3.out'
    });
    gsap.from('.hero-portrait', { opacity: 0, scale: .94, duration: .8, ease: 'power3.out', delay: .1 });
  }, 'GSAP hero entrance');

  /* ---------- anime.js: terminal "decrypt" scramble-in for the hero name ---------- */
  safe(function () {
    if (!window.anime) return;
    var target = document.querySelector('.hero h1.glitch, .page-head h1.glitch');
    if (!target) return;
    var finalText = target.dataset.text || target.textContent;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#0123456789';
    var original = target.innerHTML;
    var frame = { n: 0 };
    var totalFrames = 26;

    function render(progress) {
      var revealCount = Math.floor(progress * finalText.length);
      var out = '';
      for (var i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ') { out += ' '; continue; }
        out += i < revealCount ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
      }
      target.textContent = out;
    }

    anime({
      targets: frame,
      n: totalFrames,
      round: 1,
      easing: 'linear',
      duration: 900,
      update: function () { render(frame.n / totalFrames); },
      complete: function () { target.innerHTML = original; }
    });
  }, 'anime.js text decrypt');

  /* ---------- anime.js: 3D tilt for cards (service / project / cert) ---------- */
  safe(function () {
    if (!window.anime) return;
    var cards = document.querySelectorAll('.service-card, .cert-card, .deepdive-card, .skill-item');
    cards.forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      var rect;
      card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        anime({
          targets: card,
          rotateY: px * 8,
          rotateX: -py * 8,
          duration: 260,
          easing: 'easeOutQuad'
        });
      });
      card.addEventListener('mouseleave', function () {
        anime({ targets: card, rotateY: 0, rotateX: 0, duration: 500, easing: 'easeOutElastic(1, .6)' });
      });
    });
  }, 'anime.js 3D card tilt');

  /* ---------- anime.js: staggered 3D grid entrance ---------- */
  safe(function () {
    if (!window.anime) return;
    var grids = document.querySelectorAll('.grid, .deepdive-list, .skill-list');
    grids.forEach(function (grid) {
      var items = Array.prototype.slice.call(grid.children);
      if (!items.length) return;
      items.forEach(function (el) { el.style.opacity = 0; });
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [26, 0],
            rotateX: [8, 0],
            duration: 650,
            easing: 'easeOutCubic'
          });
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.15 });
      items.forEach(function (el, i) {
        el.style.transformStyle = 'preserve-3d';
        setTimeout(function () { io.observe(el); }, i * 40);
      });
    });
  }, 'anime.js grid entrance');

  /* ---------- ASCII art: precise runtime sizing (no overflow, no gaps) ---------- */
  safe(function () {
    var art = document.querySelector('.ascii-art');
    var wrap = document.querySelector('.ascii-art-wrap');
    if (!art || !wrap) return;
    var cols = parseInt(art.dataset.cols || '100', 10);

    // Measure actual monospace character width at a known font-size to get an exact ratio
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font-family:' + getComputedStyle(art).fontFamily + ';font-size:100px;';
    probe.textContent = 'M'.repeat(20);
    document.body.appendChild(probe);
    var charRatio = (probe.getBoundingClientRect().width / 20) / 100; // char width as a fraction of font-size
    document.body.removeChild(probe);

    function fit () {
      var available = wrap.clientWidth;
      if (!available) return;
      var fontSize = (available / (cols * charRatio)) * 0.985; // small safety margin
      fontSize = Math.max(2.4, Math.min(fontSize, 9));
      art.style.fontSize = fontSize.toFixed(2) + 'px';
    }
    fit();
    window.addEventListener('resize', function () {
      clearTimeout(window.__asciiFitT);
      window.__asciiFitT = setTimeout(fit, 120);
    });
  }, 'ascii art fit');

  /* ---------- Sidebar collapse toggle (desktop rail / mobile drawer) ---------- */
  safe(function () {
    var sidebarToggle = document.getElementById('sidebarToggle');
    if (!sidebarToggle) return;
    var collapsed = localStorage.getItem('tg-sidebar-collapsed') === '1';
    if (collapsed) document.body.classList.add('sidebar-collapsed');

    sidebarToggle.addEventListener('click', function () {
      if (window.innerWidth <= 900) {
        if (sidebar) sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
        return;
      }
      var isCollapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('tg-sidebar-collapsed', isCollapsed ? '1' : '0');

      safe(function () {
        if (window.gsap) {
          gsap.fromTo(sidebarToggle, { x: isCollapsed ? 0 : -8 }, { x: 0, duration: .45, ease: 'back.out(2.4)' });
          gsap.to(sidebarToggle.querySelector('i'), { rotate: isCollapsed ? 180 : 0, duration: .4, ease: 'power2.inOut' });
        }
      }, 'sidebar toggle icon animation');
    });
  }, 'sidebar collapse toggle');

  /* ---------- Cursor-reactive background glow ---------- */
  safe(function () {
    var bgGlow = document.getElementById('bgGlow');
    if (!bgGlow || !window.matchMedia('(pointer: fine)').matches) return;
    var rafPending = false, lastX = 50, lastY = 30;
    window.addEventListener('mousemove', function (e) {
      lastX = (e.clientX / window.innerWidth) * 100;
      lastY = (e.clientY / window.innerHeight) * 100;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(function () {
          document.documentElement.style.setProperty('--mx', lastX + '%');
          document.documentElement.style.setProperty('--my', lastY + '%');
          rafPending = false;
        });
      }
    });
  }, 'cursor glow background');

  /* ---------- Tilt effect for animated photo (about page) ---------- */
  safe(function () {
    document.querySelectorAll('.tilt-card').forEach(function (card) {
      var rect;
      card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (px * 10) + 'deg) rotateX(' + (-py * 10) + 'deg) translateZ(0)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
      });
    });
  }, 'tilt card effect');

  /* ---------- Active nav link ---------- */
  safe(function () {
    var current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[data-page]').forEach(function (link) {
      if (link.dataset.page === current) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }, 'active nav highlighting');

  /* ---------- Scroll reveal (single reliable system — drives all .reveal elements) ---------- */
  safe(function () {
    var revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    function reveal (el) {
      if (window.gsap) {
        gsap.to(el, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' });
      } else {
        el.classList.add('is-visible');
      }
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(reveal);
    }
  }, 'scroll reveal');

  /* ---------- Typewriter (home hero) ---------- */
  safe(function () {
    var tw = document.getElementById('typewriter');
    if (!tw) return;
    var roles = JSON.parse(tw.dataset.roles || '[]');
    var roleIdx = 0, charIdx = 0, deleting = false;

    function tick () {
      var word = roles[roleIdx];
      if (!deleting) {
        charIdx++;
        tw.textContent = word.slice(0, charIdx);
        if (charIdx === word.length) {
          deleting = true;
          return setTimeout(tick, 1400);
        }
      } else {
        charIdx--;
        tw.textContent = word.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 45 : 85);
    }
    tick();
  }, 'typewriter');

  /* ---------- Skill proficiency bars ---------- */
  safe(function () {
    var bars = document.querySelectorAll('.skill-bar-fill');
    if (!bars.length) return;
    var barIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.level + '%';
          barIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) { barIO.observe(b); });
  }, 'skill bars');

  /* ---------- Project filters ---------- */
  safe(function () {
    var filterBar = document.getElementById('projectFilters');
    if (!filterBar) return;
    var cards = document.querySelectorAll('.project-card');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var f = btn.dataset.filter;
      cards.forEach(function (card) {
        var show = f === 'all' || card.dataset.category === f;
        card.style.display = show ? '' : 'none';
      });
    });
  }, 'project filters');

  /* ---------- Contact form (Formspree) ---------- */
  safe(function () {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      status.textContent = 'Sending your message…';
      status.className = 'form-status';
      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          status.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
          status.classList.add('is-success');
          form.reset();
        } else {
          response.json().then(function (resData) {
            status.textContent = (resData.errors && resData.errors.map(function(er){return er.message;}).join(', ')) ||
              'Something went wrong. Please email me directly instead.';
            status.classList.add('is-error');
          }).catch(function () {
            status.textContent = 'Something went wrong. Please email me directly instead.';
            status.classList.add('is-error');
          });
        }
      }).catch(function () {
        status.textContent = 'Network error — please email me directly instead.';
        status.classList.add('is-error');
      });
    });
  }, 'contact form');

  /* ---------- Footer year ---------- */
  safe(function () {
    document.querySelectorAll('.js-year').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }, 'footer year');

  /* ---------- Preloader (Lottie loading state) ---------- */
  safe(function () {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;
    var lottieContainer = document.getElementById('preloaderLottie');
    var animInstance = null;

    var LOADER_LOTTIE_DATA = {"v":"5.9.6","fr":30,"ip":0,"op":60,"w":200,"h":100,"nm":"loader-dots","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"dot1","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,50,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":0,"s":[55,55,100],"e":[130,130,100],"i":{"x":[0.4],"y":[1]},"o":{"x":[0.6],"y":[0]}},{"t":20,"s":[130,130,100],"e":[55,55,100],"i":{"x":[0.4],"y":[1]},"o":{"x":[0.6],"y":[0]}},{"t":40,"s":[55,55,100]}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"el","p":{"a":0,"k":[0,0]},"s":{"a":0,"k":[26,26]}},{"ty":"fl","c":{"a":0,"k":[0.949,0.71,0.267,1]},"o":{"a":0,"k":100}},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"dot2","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[100,50,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":7,"s":[55,55,100],"e":[130,130,100],"i":{"x":[0.4],"y":[1]},"o":{"x":[0.6],"y":[0]}},{"t":27,"s":[130,130,100],"e":[55,55,100],"i":{"x":[0.4],"y":[1]},"o":{"x":[0.6],"y":[0]}},{"t":47,"s":[55,55,100]}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"el","p":{"a":0,"k":[0,0]},"s":{"a":0,"k":[26,26]}},{"ty":"fl","c":{"a":0,"k":[0.949,0.71,0.267,1]},"o":{"a":0,"k":100}},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"dot3","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[140,50,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":14,"s":[55,55,100],"e":[130,130,100],"i":{"x":[0.4],"y":[1]},"o":{"x":[0.6],"y":[0]}},{"t":34,"s":[130,130,100],"e":[55,55,100],"i":{"x":[0.4],"y":[1]},"o":{"x":[0.6],"y":[0]}},{"t":54,"s":[55,55,100]}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"el","p":{"a":0,"k":[0,0]},"s":{"a":0,"k":[26,26]}},{"ty":"fl","c":{"a":0,"k":[0.949,0.71,0.267,1]},"o":{"a":0,"k":100}},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0}]};

    if (window.lottie && lottieContainer) {
      animInstance = lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: LOADER_LOTTIE_DATA
      });
    }

    function hidePreloader () {
      preloader.classList.add('is-hidden');
      setTimeout(function () {
        preloader.style.display = 'none';
        if (animInstance) animInstance.destroy();
      }, 500);
    }

    var minTimer = setTimeout(hidePreloader, 700);
    window.addEventListener('load', function () {
      clearTimeout(minTimer);
      setTimeout(hidePreloader, 150);
    });
    // Safety net: never let the preloader hang around too long
    setTimeout(hidePreloader, 3000);
  }, 'preloader');
});

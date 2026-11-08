/* ============================================================================
   geracao-de-tutorial — infrastructure.js
   ============================================================================
   Vanilla JS (no dependencies). Wire up:
     1. Theme toggle with localStorage
     2. Reading progress bar
     3. Back-to-top button
     4. Scroll-spy (highlight current TOC section)
     5. Copy-to-clipboard for code blocks
     6. Math symbol tooltips (post-MathJax DOM walk)
     7. prefers-reduced-motion handler for SMIL animations
   ============================================================================ */


/* ============================================================================
   1. Theme toggle (light/dark with localStorage persistence)
   ============================================================================ */

(function() {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  var saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
  }

  btn.addEventListener('click', function() {
    var cur = document.documentElement.getAttribute('data-theme');
    var sysLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    // If no explicit theme set, use the inverse of system preference
    if (!cur) cur = sysLight ? 'light' : 'dark';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();


/* ============================================================================
   2. Reading progress bar
   ============================================================================ */

(function() {
  var bar = document.getElementById('reading-progress');
  if (!bar) return;

  function update() {
    var max = document.body.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', Math.round(pct));
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();


/* ============================================================================
   3. Back-to-top button
   ============================================================================ */

(function() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;

  function toggle() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================================
   4. Scroll-spy — highlight TOC link for current section
   ============================================================================ */

(function() {
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.toc a[href^="#"]');
  if (!sections.length || !links.length) return;

  var linkById = {};
  links.forEach(function(l) {
    var id = l.getAttribute('href').slice(1);
    linkById[id] = l;
  });

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var id = e.target.id;
      var link = linkById[id];
      if (!link) return;
      links.forEach(function(l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(function(s) { io.observe(s); });
})();


/* ============================================================================
   5. Copy-to-clipboard for code blocks
   ============================================================================ */

(function() {
  document.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var block = btn.closest('.code-block');
      if (!block) return;
      var code = block.querySelector('pre code') || block.querySelector('pre');
      if (!code) return;
      var text = code.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          btn.textContent = 'copied!';
          btn.classList.add('copied');
          setTimeout(function() {
            btn.textContent = 'copy';
            btn.classList.remove('copied');
          }, 1500);
        });
      } else {
        // Fallback for older browsers
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });
})();


/* ============================================================================
   6. Math symbol tooltips (post-MathJax DOM walk)
   ============================================================================ */

(function() {
  // Greek symbols are unambiguous and safe to auto-annotate everywhere they
  // appear in MathJax output. DO NOT include single Latin letters (L, A, r) —
  // those over-match every italic identifier MathJax produces in the document.
  var SYMBOL_TIPS = {
    'π': 'π (pi) — the circle constant (≈3.14159), or a symbol for a probability / distribution',
    'θ': 'θ (theta) — commonly an angle, or a set of parameters',
    'ε': 'ε (epsilon) — a small positive constant (tolerance / error bound)',
    'β': 'β (beta) — a coefficient or weight (e.g., a trade-off or regularization strength)',
    'σ': 'σ (sigma) — standard deviation, or the sigmoid function',
    'α': 'α (alpha) — a scale, rate, or significance level',
    'μ': 'μ (mu) — the mean (average) of a distribution',
    'γ': 'γ (gamma) — a scaling or discount factor',
    'λ': 'λ (lambda) — a rate parameter or regularization weight',
    'τ': 'τ (tau) — a threshold, temperature, or time constant',
    'Φ': 'Φ (Phi) — a cumulative distribution function',
    'φ': 'φ (phi) — a feature / basis function, or the golden ratio',
  };

  // \mathbb{E} renders as <mjx-mi mathvariant="double-struck">E</mjx-mi>.
  // textContent is literal "E"; we detect via mathvariant attribute.
  var DOUBLE_STRUCK_TIPS = {
    'E': '𝔼 (expectation) — the probability-weighted average over outcomes',
    'R': 'ℝ — the real numbers',
    'N': 'ℕ — the natural numbers',
    'Z': 'ℤ — the integers',
    'P': 'ℙ — probability measure',
    'Q': 'ℚ — the rationals',
  };

  function annotate() {
    var els = document.querySelectorAll('mjx-mi, mjx-mn, mjx-mo, mjx-mtext');
    var added = 0;
    els.forEach(function(el) {
      if (el.hasAttribute('title')) return;
      var t = (el.textContent || '').trim();
      var tip = null;
      if (t in SYMBOL_TIPS) {
        tip = SYMBOL_TIPS[t];
      } else if (t in DOUBLE_STRUCK_TIPS) {
        var mv = el.getAttribute('mathvariant') || '';
        var cls = el.getAttribute('class') || '';
        if (mv === 'double-struck' || /double-struck|mathbb/i.test(cls)) {
          tip = DOUBLE_STRUCK_TIPS[t];
        }
      }
      if (tip) {
        el.setAttribute('title', tip);
        // tabindex=0 makes the symbol keyboard-focusable so screen-reader and
        // keyboard-only users can also access the tooltip
        el.setAttribute('tabindex', '0');
        added++;
      }
    });
  }


/* ============================================================================
   7. prefers-reduced-motion — pause SMIL animations
   ============================================================================ */
   /* CSS @media (prefers-reduced-motion: reduce) only affects CSS animations.
      SMIL <animate>/<animateTransform>/<animateMotion> ignore the media query.
      Pause them manually via JS. */

  function honorReducedMotion() {
    if (!window.matchMedia) return;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('svg').forEach(function(svg) {
      if (svg.pauseAnimations) {
        try { svg.pauseAnimations(); } catch (e) {}
      }
    });
    // Also kill begin attributes so they don't restart
    document.querySelectorAll('animate, animateTransform, animateMotion').forEach(function(el) {
      el.setAttribute('begin', 'indefinite');
    });
  }


  /* Wiring */
  function whenReady() {
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
      window.MathJax.startup.promise.then(function() {
        annotate();
        honorReducedMotion();
        // Re-annotate after any subsequent typeset (theme toggle, dynamic content)
        if (window.MathJax.typesetPromise) {
          var origTypeset = window.MathJax.typesetPromise.bind(window.MathJax);
          window.MathJax.typesetPromise = function(args) {
            return origTypeset(args).then(annotate);
          };
        }
      });
    } else {
      // Fallback if MathJax startup not exposed — retry a few times
      setTimeout(annotate, 800);
      setTimeout(annotate, 2000);
      setTimeout(annotate, 4000);
      honorReducedMotion();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', whenReady);
  } else {
    whenReady();
  }
})();

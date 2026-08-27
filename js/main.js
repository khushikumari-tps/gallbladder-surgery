/* Advitya Healthcares — Gallbladder Surgery page interactions */
(function () {
  'use strict';

  var WA_NUMBER = '919211221551';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- brand mark shrinks on scroll ---------- */
  var brandmark = $('#brandmark');
  if (brandmark) {
    var syncBrand = function () {
      brandmark.classList.toggle('is-compact', window.scrollY > 80);
    };
    window.addEventListener('scroll', syncBrand, { passive: true });
    syncBrand();
  }

  /* ---------- scroll reveal ---------- */
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = Math.min(i * 70, 280);
        setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var panel = $('.faq__a', item);
      var open = btn.getAttribute('aria-expanded') === 'true';

      // close siblings
      $$('.faq__item.is-open').forEach(function (other) {
        if (other === item) return;
        other.classList.remove('is-open');
        $('.faq__q', other).setAttribute('aria-expanded', 'false');
        $('.faq__a', other).style.maxHeight = null;
      });

      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
      panel.style.maxHeight = open ? null : panel.scrollHeight + 'px';
    });
  });
  window.addEventListener('resize', function () {
    $$('.faq__item.is-open .faq__a').forEach(function (p) {
      p.style.maxHeight = p.scrollHeight + 'px';
    });
  });

  /* open the first FAQ so the section does not read as a wall of closed rows */
  var firstFaq = $('.faq__item');
  if (firstFaq) {
    var fq = $('.faq__q', firstFaq), fa = $('.faq__a', firstFaq);
    firstFaq.classList.add('is-open');
    fq.setAttribute('aria-expanded', 'true');
    window.addEventListener('load', function () { fa.style.maxHeight = fa.scrollHeight + 'px'; });
    fa.style.maxHeight = fa.scrollHeight + 'px';
  }

  /* ---------- location map + venue switcher ---------- */
  var mapFrame = $('#loc-map-frame');

  $$('.venue').forEach(function (venue) {
    venue.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;   // let phone / directions / booking links work

      $$('.venue').forEach(function (v) {
        v.classList.remove('is-active');
        v.setAttribute('aria-pressed', 'false');
      });
      venue.classList.add('is-active');
      venue.setAttribute('aria-pressed', 'true');

      var cardName = $('#map-card-name'), cardAddr = $('#map-card-addr'), cardGo = $('#map-card-go');
      if (cardName) cardName.innerHTML = venue.getAttribute('data-name');
      if (cardAddr) cardAddr.innerHTML = venue.getAttribute('data-addr');
      if (cardGo) cardGo.href = venue.getAttribute('data-dir');

      if (mapFrame) {
        mapFrame.src = venue.getAttribute('data-map');
        mapFrame.title = 'Map of ' + venue.getAttribute('data-venue');
      }
    });
  });

  /* ---------- booking widget: location, date and time pickers ---------- */
  var DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
               '12:00', '12:30', '16:00', '16:30', '17:00', '17:30'];

  var picked = { location: 'Kolkata', date: '', time: '' };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function label12(hhmm) {
    var parts = hhmm.split(':');
    var h = parseInt(parts[0], 10);
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + parts[1] + ' ' + suffix;
  }

  function makeSlot(top, main, value, extraClass) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (extraClass ? ' ' + extraClass : '');
    b.setAttribute('aria-pressed', 'false');
    b.dataset.value = value;
    b.innerHTML = extraClass === 'slot--time'
      ? '<b>' + main + '</b><small>' + top + '</small>'
      : '<small>' + top + '</small><b>' + main + '</b>';
    return b;
  }

  function selectIn(track, btn, key) {
    $$('.slot', track).forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
    btn.setAttribute('aria-pressed', 'true');
    picked[key] = btn.dataset.value;
  }

  var dateTrack = $('#date-track');
  var timeTrack = $('#time-track');

  if (dateTrack) {
    var today = new Date();
    for (var i = 0; i < 12; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      var btn = makeSlot(i === 0 ? 'Today' : DAYS[d.getDay()], String(d.getDate()), isoOf(d));
      btn.setAttribute('aria-label', 'Preferred date ' + d.toDateString());
      dateTrack.appendChild(btn);
    }
    dateTrack.addEventListener('click', function (e) {
      var btn = e.target.closest('.slot');
      if (btn) selectIn(dateTrack, btn, 'date');
    });
    selectIn(dateTrack, $('.slot', dateTrack), 'date');
  }

  if (timeTrack) {
    TIMES.forEach(function (t) {
      var parts = label12(t).split(' ');
      var btn = makeSlot(parts[1], parts[0], t, 'slot--time');
      btn.setAttribute('aria-label', 'Preferred time ' + label12(t));
      timeTrack.appendChild(btn);
    });
    timeTrack.addEventListener('click', function (e) {
      var btn = e.target.closest('.slot');
      if (btn) selectIn(timeTrack, btn, 'time');
    });
    selectIn(timeTrack, $('.slot', timeTrack), 'time');
  }

  $$('.picker').forEach(function (picker) {
    var track = $('.picker__track', picker);
    var prev = $('.picker__btn--prev', picker);
    var next = $('.picker__btn--next', picker);
    if (!track) return;

    function sync() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    function nudge(dir) {
      track.scrollBy({ left: dir * Math.max(track.clientWidth * 0.8, 120), behavior: 'smooth' });
      setTimeout(sync, 380);
    }
    prev.addEventListener('click', function () { nudge(-1); });
    next.addEventListener('click', function () { nudge(1); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  $$('input[name="w-location"]').forEach(function (r) {
    r.addEventListener('change', function () { picked.location = r.value; });
  });

  var widgetBook = $('#widget-book');
  if (widgetBook) {
    widgetBook.addEventListener('click', function () {
      openModal(widgetBook);
    });
  }

  /* ---------- care-journey timeline arrows ---------- */
  var tlTrack = $('#journey-track');
  if (tlTrack) {
    var tlPrev = $('.tl-prev'), tlNext = $('.tl-next');
    var tlSync = function () {
      var max = tlTrack.scrollWidth - tlTrack.clientWidth - 2;
      if (tlPrev) tlPrev.disabled = tlTrack.scrollLeft <= 2 || max <= 0;
      if (tlNext) tlNext.disabled = tlTrack.scrollLeft >= max || max <= 0;
    };
    var tlNudge = function (dir) {
      tlTrack.scrollBy({ left: dir * Math.max(tlTrack.clientWidth * 0.6, 240), behavior: 'smooth' });
      setTimeout(tlSync, 400);
    };
    if (tlPrev) tlPrev.addEventListener('click', function () { tlNudge(-1); });
    if (tlNext) tlNext.addEventListener('click', function () { tlNudge(1); });
    tlTrack.addEventListener('scroll', tlSync, { passive: true });
    window.addEventListener('resize', tlSync);
    tlSync();
  }

  /* ---------- quick-start modal ---------- */
  var modal = $('#quick-modal');
  var quickForm = $('#quick-form');
  var quickPhone = $('#quick-phone');
  var quickError = $('#quick-error');
  var lastFocus = null;

  function normalisePhone(value) {
    return String(value || '').replace(/[^0-9]/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  }

  function openModal(trigger) {
    if (!modal) return;
    lastFocus = trigger || document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    if (quickError) { quickError.textContent = ''; quickError.classList.remove('is-visible'); }
    setTimeout(function () { if (quickPhone) quickPhone.focus(); }, 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openWhatsApp(lines) {
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')),
      '_blank', 'noopener');
  }

  function sendRequest(phone) {
    var lines = [
      'Gallbladder consultation request — Advitya Healthcares',
      'Mobile: +91 ' + phone,
      'Preferred location: ' + picked.location
    ];
    if (picked.date) lines.push('Preferred date: ' + picked.date);
    if (picked.time) lines.push('Preferred time: ' + label12(picked.time));
    openWhatsApp(lines);
  }

  /* ---------- booking links ---------- */
  $$('[data-book]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.hasAttribute('data-loc')) {
        var value = el.getAttribute('data-loc');
        picked.location = value;
        var radio = $('input[name="w-location"][value="' + value + '"]');
        if (radio) radio.checked = true;
      }
      e.preventDefault();
      openModal(el);
    });
  });

  if (modal) {
    $$('[data-modal-close]', modal).forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });
    modal.addEventListener('mousedown', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        var focusable = $$('button, input, a[href]', modal).filter(function (n) { return !n.disabled; });
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  if (quickForm) {
    quickForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var digits = normalisePhone(quickPhone.value);
      if (!/^[6-9][0-9]{9}$/.test(digits)) {
        quickError.textContent = 'Please enter a valid 10-digit Indian mobile number.';
        quickError.classList.add('is-visible');
        quickPhone.focus();
        return;
      }
      quickError.textContent = 'Opening WhatsApp with your request …';
      quickError.classList.add('is-visible', 'is-ok');
      sendRequest(digits);
      setTimeout(function () {
        quickError.classList.remove('is-ok');
        quickForm.reset();
        closeModal();
      }, 1400);
    });
  }

  /* ---------- share + read more ---------- */
  var shareBtn = $('#share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var data = { title: document.title, url: location.href };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          shareBtn.setAttribute('aria-label', 'Page link copied');
        }).catch(function () {});
      }
    });
  }

  var aboutToggle = $('#about-toggle');
  var aboutMore = $('#about-more');
  if (aboutToggle && aboutMore) {
    aboutToggle.addEventListener('click', function () {
      var open = aboutToggle.getAttribute('aria-expanded') === 'true';
      aboutToggle.setAttribute('aria-expanded', String(!open));
      aboutMore.classList.toggle('is-open', !open);
      aboutToggle.childNodes[0].nodeValue = open ? 'Read More ' : 'Read Less ';
    });
  }

  /* ---------- footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

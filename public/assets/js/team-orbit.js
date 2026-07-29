(function () {
  var orbit = document.querySelector('.team-orbit');
  if (!orbit) return;

  var sats = Array.prototype.slice.call(orbit.querySelectorAll('.team-orbit__avatar'));
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Shuffle every member across all orbital slots — both rings — on each load.
  // Placement implies no ranking: anyone can land on any orbit, any position.
  var slots = sats.map(function (sat) {
    return { ring: sat.getAttribute('data-ring'), angle: sat.getAttribute('data-angle') };
  });
  for (var slotIndex = slots.length - 1; slotIndex > 0; slotIndex -= 1) {
    var swapIndex = Math.floor(Math.random() * (slotIndex + 1));
    var held = slots[slotIndex];
    slots[slotIndex] = slots[swapIndex];
    slots[swapIndex] = held;
  }
  sats.forEach(function (sat, index) {
    sat.setAttribute('data-ring', slots[index].ring);
    sat.setAttribute('data-angle', slots[index].angle);
  });
  // phi/squash must match the ring elements' transforms in styles.css.
  var rings = {
    outer: { factor: 1, dir: 1, period: 100, squash: 0.42, phi: 5 * Math.PI / 180 },
    inner: { factor: 0.62, dir: -1, period: 75, squash: 0.55, phi: -18 * Math.PI / 180 }
  };
  var t = 0;
  var factor = 1;
  var target = 1;
  var last = null;
  var hoveredSat = null;
  var focusedSat = null;

  function updateOrbitSpeed() {
    if (currentSlug) target = 0.1;
    else if (hoveredSat || focusedSat) target = 0.16;
    else target = 1;
  }

  sats.forEach(function (sat) {
    sat.addEventListener('mouseenter', function () {
      hoveredSat = sat;
      updateOrbitSpeed();
    });
    sat.addEventListener('mouseleave', function () {
      if (hoveredSat === sat) hoveredSat = null;
      updateOrbitSpeed();
    });
    sat.addEventListener('focus', function () {
      focusedSat = sat;
      updateOrbitSpeed();
    });
    sat.addEventListener('blur', function () {
      if (focusedSat === sat) focusedSat = null;
      updateOrbitSpeed();
    });
  });

  function place() {
    var base = orbit.querySelector('.team-orbit__ring-flat').offsetWidth / 2;
    sats.forEach(function (sat) {
      var ring = rings[sat.getAttribute('data-ring')] || rings.outer;
      var radius = base * ring.factor;
      var a = parseFloat(sat.getAttribute('data-angle')) * Math.PI / 180 + ring.dir * t * 2 * Math.PI / ring.period;
      var px = Math.cos(a) * radius;
      var pz = Math.sin(a) * radius;
      var ey = pz * ring.squash;
      var x = px * Math.cos(ring.phi) - ey * Math.sin(ring.phi);
      var y = px * Math.sin(ring.phi) + ey * Math.cos(ring.phi);
      // World depth scales with orbit radius, so ring crossings layer correctly:
      // an outer-ring member out front always covers an inner-ring member, and
      // the inner ring passes in front of the outer ring's far side only.
      var depth = Math.sin(a) * ring.factor;
      var scale = 1 + 0.22 * depth;

      sat.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) scale(' + scale.toFixed(3) + ')';
      sat.style.zIndex = String(10 + Math.round(depth * 8));
      sat.style.opacity = (0.55 + 0.45 * (depth + 1) / 2).toFixed(3);

      var name = sat.querySelector('.team-orbit__name');
      name.style.transform = 'translate(-50%, -50%) translate(0px, ' + (sat.offsetWidth / 2 + 14).toFixed(2) + 'px)';
    });
    placeProfile();
  }

  place();
  window.addEventListener('resize', place);
  if (!reduced) {
    function frame(ts) {
      if (last === null) last = ts;
      var dt = Math.min((ts - last) / 1000, 0.1);
      last = ts;
      factor += (target - factor) * Math.min(1, dt * 5);
      t += dt * factor;
      place();
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  var dataEl = document.getElementById('team-data');
  var team = dataEl ? JSON.parse(dataEl.textContent) : {};
  var modal = document.getElementById('profile-modal');
  var modalBody = document.getElementById('profile-modal-body');
  var modalPage = document.getElementById('profile-modal-page');
  var modalCopy = document.getElementById('profile-modal-copy');
  var modalCard = modal ? modal.querySelector('.profile-modal__card') : null;
  var modalTether = modal ? modal.querySelector('.profile-modal__tether') : null;
  var currentSlug = null;
  var activeSat = null;
  var returnFocus = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function placeProfile() {
    if (!modal || modal.hidden || !modalCard || !modalTether || !activeSat) return;

    var anchorRect = activeSat.getBoundingClientRect();
    var anchorX = anchorRect.left + anchorRect.width / 2;
    var anchorY = anchorRect.top + anchorRect.height / 2;
    var cardWidth = modalCard.offsetWidth;
    var cardHeight = modalCard.offsetHeight;
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var margin = 12;
    var gap = viewportWidth >= 720 ? 34 : 24;
    var x;
    var y;

    if (viewportWidth >= 720) {
      x = anchorX < viewportWidth / 2 ? anchorX + gap : anchorX - cardWidth - gap;
      y = anchorY - cardHeight / 2;
    } else {
      x = anchorX - cardWidth / 2;
      y = anchorY < viewportHeight / 2 ? anchorY + gap : anchorY - cardHeight - gap;
    }

    x = clamp(x, margin, Math.max(margin, viewportWidth - cardWidth - margin));
    y = clamp(y, margin, Math.max(margin, viewportHeight - cardHeight - margin));
    modalCard.style.setProperty('--profile-x', x.toFixed(2) + 'px');
    modalCard.style.setProperty('--profile-y', y.toFixed(2) + 'px');

    var endX = clamp(anchorX, x, x + cardWidth);
    var endY = clamp(anchorY, y, y + cardHeight);
    if (anchorX >= x && anchorX <= x + cardWidth) {
      endY = anchorY < y + cardHeight / 2 ? y : y + cardHeight;
    } else {
      endX = anchorX < x ? x : x + cardWidth;
    }
    var dx = endX - anchorX;
    var dy = endY - anchorY;
    var length = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
    modalTether.style.setProperty('--tether-x', anchorX.toFixed(2) + 'px');
    modalTether.style.setProperty('--tether-y', anchorY.toFixed(2) + 'px');
    modalTether.style.setProperty('--tether-length', length.toFixed(2) + 'px');
    modalTether.style.setProperty('--tether-angle', angle.toFixed(2) + 'deg');
  }

  function escapeText(value) {
    var div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function openProfile(slug, push) {
    var person = team[slug];
    if (!person || !modal) return;
    if (!activeSat || activeSat.getAttribute('href') !== '/team/' + slug) {
      activeSat = orbit.querySelector('[data-team-link][href="/team/' + slug + '"]');
    }
    currentSlug = slug;
    modalBody.innerHTML =
      '<div class="profile-avatar">' + escapeText(person.initial)
        + (person.avatar ? '<img src="' + escapeText(person.avatar) + '" alt="" onerror="this.remove()">' : '')
        + '</div>' +
      '<p class="profile-modal__kicker">' + escapeText(person.role) + '</p>' +
      '<h2 class="profile-modal__name" id="profile-modal-name">' + escapeText(person.name) + '</h2>' +
      '<p class="profile-modal__mandate">' + escapeText(person.mandate) + '</p>' +
      '<div class="profile-rows">' +
        '<div class="profile-row"><span class="profile-row__term">Operates</span><span class="profile-row__desc">' + escapeText(person.operates) + '</span></div>' +
        '<div class="profile-row"><span class="profile-row__term">Builds</span><span class="profile-row__desc">' + escapeText(person.builds) + '</span></div>' +
        '<div class="profile-row"><span class="profile-row__term">Directs</span><span class="profile-row__desc">' + escapeText(person.directs) + '</span></div>' +
      '</div>';
    modalPage.href = '/team/' + slug;
    modal.hidden = false;
    if (activeSat) activeSat.classList.add('is-profile-active');
    updateOrbitSpeed();
    window.requestAnimationFrame(placeProfile);
    if (push) window.history.pushState({ profile: slug }, '', '/team/' + slug);
    modal.querySelector('.profile-modal__close').focus();
  }

  function closeProfile(restore) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    if (activeSat) activeSat.classList.remove('is-profile-active');
    currentSlug = null;
    activeSat = null;
    updateOrbitSpeed();
    if (restore && returnFocus) returnFocus.focus();
  }

  function trapModalFocus(event) {
    if (event.key !== 'Tab' || modal.hidden) return;
    var focusable = Array.prototype.slice.call(modal.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (element) {
      return element.offsetParent !== null;
    });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.querySelectorAll('[data-team-link]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var slug = link.getAttribute('href').split('/').pop();
      if (!team[slug]) return;
      event.preventDefault();
      returnFocus = link;
      activeSat = link;
      openProfile(slug, true);
    });
  });

  modal.addEventListener('click', function (event) {
    if (!event.target.hasAttribute('data-close')) return;
    if (window.history.state && window.history.state.profile) window.history.back();
    else closeProfile(true);
  });

  document.addEventListener('keydown', function (event) {
    trapModalFocus(event);
    if (event.key !== 'Escape' || modal.hidden) return;
    if (window.history.state && window.history.state.profile) window.history.back();
    else closeProfile(true);
  });

  window.addEventListener('popstate', function (event) {
    if (event.state && event.state.profile) openProfile(event.state.profile, false);
    else closeProfile(true);
  });

  modalCopy.addEventListener('click', function () {
    if (!currentSlug) return;
    navigator.clipboard.writeText('https://soterlabs.com/team/' + currentSlug).then(function () {
      modalCopy.textContent = 'Copied';
      window.setTimeout(function () { modalCopy.textContent = 'Copy link'; }, 1600);
    });
  });
})();

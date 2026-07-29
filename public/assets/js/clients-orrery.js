    // Client orrery: Sky is the sun, OEAs are planets Soter pilots,
    // serviced agents are their moons. Nested orbits = nested mandates.
    (function () {
      var orrery = document.getElementById('orrery');
      if (!orrery) return;
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var TAU = Math.PI * 2;
      var target = 1, factor = 1, t = 0, last = null;

      // Shared inner track. Add a FOUNDATION_BODIES entry (+ markup) to put
      // another body on the same orbit; phases keep them apart.
      var FOUNDATION = {
        path: document.getElementById('path-sff'),
        rf: 0.34, squash: 0.5, phi: rad(14), period: 52, dir: -1
      };
      var FOUNDATION_BODIES = [
        { el: document.getElementById('node-sff'), phase: rad(120) },
        { el: document.getElementById('node-ccea'), phase: rad(300) }
      ].filter(function (b) { return b.el; });
      // Delivered products: artificial satellites on tight orbits.
      // Add one entry (+ markup) per delivered thing.
      var SATS = [
        { el: document.getElementById('sat-console'), path: document.getElementById('path-sat-console'),
          rf: 0.21, squash: 0.42, phi: rad(-22), period: 26, dir: 1, phase: rad(40) },
        // anchored satellites ride a moon (r is px in the moon's frame)
        { el: document.getElementById('sat-osero'), path: document.getElementById('path-sat-osero'),
          anchor: 'osero', r: 36, squash: 0.5, phi: rad(18), period: 13, dir: -1, phase: rad(90) },
        { el: document.getElementById('sat-grove'), path: document.getElementById('path-sat-grove'),
          anchor: 'grove', r: 34, squash: 0.52, phi: rad(-18), period: 15, dir: 1, phase: rad(235) }
      ];
      var SYSTEMS = {
        ozone: {
          el: document.getElementById('planet-ozone'), path: document.getElementById('path-ozone'),
          moonPath: document.getElementById('moonpath-ozone'),
          rf: 0.88, squash: 0.36, phi: rad(-14), period: 150, dir: 1, phase: rad(205),
          moons: { rBase: 0.32, rMin: 80, rMax: 106, squash: 0.55, phi: rad(12), period: 40, dir: -1 }
        },
        amatsu: {
          el: document.getElementById('planet-amatsu'), path: document.getElementById('path-amatsu'),
          moonPath: document.getElementById('moonpath-amatsu'),
          rf: 0.88, squash: 0.5, phi: rad(12), period: 150, dir: 1, phase: rad(25),
          moons: { rBase: 0.28, rMin: 74, rMax: 96, squash: 0.55, phi: rad(-10), period: 32, dir: 1 }
        }
      };
      var moonEls = { ozone: [], amatsu: [] };
      Array.prototype.forEach.call(orrery.querySelectorAll('[data-sys]'), function (el) {
        moonEls[el.getAttribute('data-sys')].push(el);
      });

      function rad(d) { return d * Math.PI / 180; }

      var R = 0;
      function sizePaths() {
        var edgeGutter = orrery.clientWidth < 600 ? 48 : 90;
        R = Math.min(orrery.clientWidth / 2 - edgeGutter, 355);
        [[FOUNDATION.path, R * FOUNDATION.rf, FOUNDATION.squash, FOUNDATION.phi]].concat(
          SATS.map(function (st) { return [st.path, st.anchor ? st.r : R * st.rf, st.squash, st.phi]; })
        ).concat(
          Object.keys(SYSTEMS).map(function (k) {
            var s = SYSTEMS[k];
            return [s.path, R * s.rf, s.squash, s.phi];
          })
        ).forEach(function (cfg) {
          var el = cfg[0], r = cfg[1], sq = cfg[2], phi = cfg[3];
          el.style.width = (r * 2) + 'px';
          el.style.height = (r * 2) + 'px';
          el.style.marginLeft = -r + 'px';
          el.style.marginTop = -r + 'px';
          el.style.transform = 'rotate(' + (phi * 180 / Math.PI) + 'deg) scaleY(' + sq + ')';
        });
        Object.keys(SYSTEMS).forEach(function (k) {
          var s = SYSTEMS[k];
          var mr = moonR(s);
          var el = s.moonPath;
          el.style.width = (mr * 2) + 'px';
          el.style.height = (mr * 2) + 'px';
        });
      }

      function moonR(s) {
        var compact = orrery.clientWidth < 600 ? 0.62 : 1;
        return Math.max(s.moons.rMin * compact, Math.min(s.moons.rMax * compact, R * s.moons.rBase));
      }

      function orbitPos(r, angle, squash, phi) {
        var px = Math.cos(angle) * r;
        var pz = Math.sin(angle) * r;
        var ex = px, ey = pz * squash;
        return {
          x: ex * Math.cos(phi) - ey * Math.sin(phi),
          y: ex * Math.sin(phi) + ey * Math.cos(phi),
          d: Math.sin(angle)
        };
      }

      function place() {
        // Foundation: tight inner orbit
        FOUNDATION_BODIES.forEach(function (b) {
          var a = b.phase + FOUNDATION.dir * t * TAU / FOUNDATION.period;
          var p = orbitPos(R * FOUNDATION.rf, a, FOUNDATION.squash, FOUNDATION.phi);
          var sc = 1 + 0.16 * p.d;
          b.el.style.transform = 'translate(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px) scale(' + sc.toFixed(3) + ')';
          b.el.style.zIndex = String(100 + Math.round(p.d * 18));
          b.el.style.opacity = (0.6 + 0.4 * (p.d + 1) / 2).toFixed(3);
        });

        var anchors = {};

        SATS.forEach(function (st) {
          if (st.anchor) return;
          var sa = st.phase + st.dir * t * TAU / st.period;
          var sp = orbitPos(R * st.rf, sa, st.squash, st.phi);
          var ssc = 1 + 0.18 * sp.d;
          st.el.style.transform = 'translate(' + sp.x.toFixed(2) + 'px,' + sp.y.toFixed(2) + 'px) scale(' + ssc.toFixed(3) + ')';
          st.el.style.zIndex = String(100 + Math.round(sp.d * 14));
          st.el.style.opacity = (0.65 + 0.35 * (sp.d + 1) / 2).toFixed(3);
        });

        Object.keys(SYSTEMS).forEach(function (k) {
          var s = SYSTEMS[k];
          var pa = s.phase + s.dir * t * TAU / s.period;
          var pp = orbitPos(R * s.rf, pa, s.squash, s.phi);
          var pScale = 1 + 0.2 * pp.d;
          var pz = 100 + Math.round(pp.d * 30);
          s.el.style.transform = 'translate(' + pp.x.toFixed(2) + 'px,' + pp.y.toFixed(2) + 'px) scale(' + pScale.toFixed(3) + ')';
          // Keep the executor planet above its serviced moons so its identity and hit area stay clear.
          s.el.style.zIndex = String(pz + 6);
          s.el.style.opacity = (0.6 + 0.4 * (pp.d + 1) / 2).toFixed(3);

          // moon ring rides the planet
          var mr = moonR(s);
          var mp = s.moonPath;
          mp.style.marginLeft = -mr + 'px';
          mp.style.marginTop = -mr + 'px';
          mp.style.transform = 'translate(' + pp.x.toFixed(2) + 'px,' + pp.y.toFixed(2) + 'px) rotate(' + (s.moons.phi * 180 / Math.PI) + 'deg) scale(' + pScale.toFixed(3) + ', ' + (s.moons.squash * pScale).toFixed(3) + ')';
          mp.style.zIndex = String(pz - 2);
          mp.style.opacity = (0.4 + 0.4 * (pp.d + 1) / 2).toFixed(3);

          var n = moonEls[k].length;
          moonEls[k].forEach(function (mEl, i) {
            var ma = (i / n) * TAU + s.moons.dir * t * TAU / s.moons.period;
            var mpos = orbitPos(mr, ma, s.moons.squash, s.moons.phi);
            var mScale = pScale * (1 + 0.14 * mpos.d);
            mEl.style.transform = 'translate(' + (pp.x + mpos.x * pScale).toFixed(2) + 'px,' + (pp.y + mpos.y * pScale).toFixed(2) + 'px) scale(' + mScale.toFixed(3) + ')';
            mEl.style.zIndex = String(pz + (mpos.d >= 0 ? 3 : -3));
            mEl.style.opacity = (Math.min(1, (0.55 + 0.45 * (mpos.d + 1) / 2) * (0.7 + 0.3 * (pp.d + 1) / 2))).toFixed(3);
            var slug = mEl.getAttribute('data-client');
            if (slug) {
              anchors[slug] = {
                x: pp.x + mpos.x * pScale, y: pp.y + mpos.y * pScale,
                scale: mScale, z: pz + (mpos.d >= 0 ? 3 : -3),
                op: parseFloat(mEl.style.opacity)
              };
            }
          });
        });

        // anchored satellites: mini orbits in their moon's moving frame
        SATS.forEach(function (st) {
          if (!st.anchor) return;
          var a = anchors[st.anchor];
          if (!a) return;
          var sa = st.phase + st.dir * t * TAU / st.period;
          var lp = orbitPos(st.r, sa, st.squash, st.phi);
          var x = a.x + lp.x * a.scale;
          var y = a.y + lp.y * a.scale;
          var sc = a.scale * (1 + 0.16 * lp.d);
          st.el.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) scale(' + sc.toFixed(3) + ')';
          st.el.style.zIndex = String(a.z + (lp.d >= 0 ? 2 : -2));
          st.el.style.opacity = Math.min(1, a.op * (0.75 + 0.25 * (lp.d + 1))).toFixed(3);
          st.path.style.transform = 'translate(' + a.x.toFixed(2) + 'px,' + a.y.toFixed(2) + 'px) rotate(' + (st.phi * 180 / Math.PI) + 'deg) scale(' + a.scale.toFixed(3) + ', ' + (st.squash * a.scale).toFixed(3) + ')';
          st.path.style.zIndex = String(a.z - 1);
          st.path.style.opacity = (a.op * 0.5).toFixed(3);
        });
      }

      var hoveredBody = null;
      var focusedBody = null;
      function updateOrbitSpeed() {
        var examining = hoveredBody || focusedBody;
        target = examining ? 0.2 : 1;
        orrery.setAttribute('data-motion', examining ? 'slow' : 'full');
      }

      // Empty space stays at full speed. Examining a real body eases the system down without freezing it.
      Array.prototype.forEach.call(orrery.querySelectorAll('.orrery__body, .orrery__sun'), function (el) {
        el.addEventListener('mouseenter', function () {
          hoveredBody = el;
          updateOrbitSpeed();
        });
        el.addEventListener('mouseleave', function () {
          if (hoveredBody === el) hoveredBody = null;
          updateOrbitSpeed();
        });
        el.addEventListener('focus', function () {
          focusedBody = el;
          updateOrbitSpeed();
        });
        el.addEventListener('blur', function () {
          if (focusedBody === el) focusedBody = null;
          updateOrbitSpeed();
        });
      });
      updateOrbitSpeed();


      // Master/detail: orrery bodies and the index list drive one card
      var indexEl = document.getElementById('client-index');
      var systemByClient = {
        ozone: 'ozone', obex: 'ozone', skybase: 'ozone', pattern: 'ozone', osero: 'ozone', la7: 'ozone',
        amatsu: 'amatsu', spark: 'amatsu', grove: 'amatsu', keel: 'amatsu'
      };
      function selectClient(slug, scroll) {
        var activeSystem = systemByClient[slug];
        if (activeSystem) orrery.setAttribute('data-active-system', activeSystem);
        else orrery.removeAttribute('data-active-system');
        document.querySelectorAll('.client-card').forEach(function (c) {
          c.classList.toggle('is-active', c.id === 'card-' + slug);
        });
        document.querySelectorAll('.client-index__item').forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-client') === slug);
        });
        document.querySelectorAll('.orrery [data-client]').forEach(function (o) {
          o.classList.toggle('is-selected', o.getAttribute('data-client') === slug);
        });
        if (scroll && indexEl) indexEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      document.querySelectorAll('.client-index__item').forEach(function (b) {
        b.addEventListener('click', function () { selectClient(b.getAttribute('data-client'), false); });
      });
      document.querySelectorAll('.orrery [data-client]').forEach(function (o) {
        o.addEventListener('click', function (e) {
          e.preventDefault();
          selectClient(o.getAttribute('data-client'), true);
        });
        o.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectClient(o.getAttribute('data-client'), true);
          }
        });
      });
      selectClient('sky', false);

      sizePaths();
      window.addEventListener('resize', sizePaths);

      if (reduced) { place(); return; }
      function frame(ts) {
        if (last === null) last = ts;
        var dt = Math.min((ts - last) / 1000, 0.1);
        last = ts;
        factor += (target - factor) * Math.min(1, dt * 5);
        t += dt * factor;
        place();
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })();

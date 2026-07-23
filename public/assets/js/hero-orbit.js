import {
  TAU,
  createSeededRandom,
  ellipticState,
  ellipticStateAtAnomaly,
  hyperbolicMeanAtRadius,
  hyperbolicState,
  velocityHeading,
} from './orbit-math.js?v=20260716.1';

var SVG_NS = 'http://www.w3.org/2000/svg';
var CENTER = 400;
var DEG = Math.PI / 180;

var scene = document.querySelector('[data-hero-orbit-scene]');
if (scene) {
  var backOrbitLayer = scene.querySelector('[data-orbit-back]');
  var frontOrbitLayer = scene.querySelector('[data-orbit-front]');
  var backBodyLayer = scene.querySelector('[data-body-back]');
  var frontBodyLayer = scene.querySelector('[data-body-front]');
  var backEventLayer = scene.querySelector('[data-event-back]');
  var frontEventLayer = scene.querySelector('[data-event-front]');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seedBuffer = new Uint32Array(1);
  var seed = window.crypto && window.crypto.getRandomValues
    ? window.crypto.getRandomValues(seedBuffer)[0]
    : Date.now() >>> 0;
  var random = createSeededRandom(seed);

  var orbitDefinitions = [
    { a: 230, e: 0.05, inclination: 68 * DEG, node: -8 * DEG, period: 31, tone: 'light' },
    { a: 315, e: 0.09, inclination: 71 * DEG, node: 8 * DEG, period: 39, tone: 'mid' },
    { a: 395, e: 0.13, inclination: 74 * DEG, node: -15 * DEG, period: 51, tone: 'deep' },
  ];

  scene.dataset.orbitSeed = String(seed);

  function between(min, max) {
    return min + random() * (max - min);
  }

  // Small glowing specks riding each orbit, in place of literal planets/satellites.
  var SPECKS_PER_ORBIT = 4;
  var speckDefinitions = [];
  for (var orbitIndex = 0; orbitIndex < orbitDefinitions.length; orbitIndex += 1) {
    for (var speckSlot = 0; speckSlot < SPECKS_PER_ORBIT; speckSlot += 1) {
      speckDefinitions.push({
        orbit: orbitIndex,
        phase: TAU * speckSlot / SPECKS_PER_ORBIT + between(0.1, TAU / SPECKS_PER_ORBIT - 0.1),
        radius: between(1.2, 2.4),
      });
    }
  }

  function svgElement(name, attributes) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, String(attributes[key]));
    });
    return node;
  }

  function appendDepthSegment(points, isFront, orbitIndex) {
    if (points.length < 2) return;
    var path = svgElement('path', {
      d: points.map(function (point, index) {
        return (index ? 'L' : 'M') + (CENTER + point.x).toFixed(2) + ' ' + (CENTER + point.y).toFixed(2);
      }).join(' '),
      class: 'hero-orbit-path hero-orbit-path--' + (orbitIndex + 1) + (isFront ? ' is-front' : ' is-back'),
      'data-orbit-index': orbitIndex,
      'vector-effect': 'non-scaling-stroke',
    });
    (isFront ? frontOrbitLayer : backOrbitLayer).appendChild(path);
  }

  function buildOrbitPath(elements, orbitIndex) {
    var currentPoints = [];
    var currentFront = null;

    for (var i = 0; i <= 240; i += 1) {
      var state = ellipticStateAtAnomaly(elements, TAU * i / 240);
      var isFront = state.z >= 0;
      if (currentFront === null) currentFront = isFront;
      if (isFront !== currentFront) {
        currentPoints.push(state);
        appendDepthSegment(currentPoints, currentFront, orbitIndex);
        currentPoints = [state];
        currentFront = isFront;
      } else {
        currentPoints.push(state);
      }
    }
    appendDepthSegment(currentPoints, currentFront, orbitIndex);
  }

  function buildSpeck(definition, index) {
    var group = svgElement('g', {
      class: 'hero-orbit-body hero-orbit-body--speck',
      'data-orbit-body': index,
    });
    group.appendChild(svgElement('circle', { class: 'hero-orbit-speck__halo', r: definition.radius * 2.7, filter: 'url(#hero-body-glow)' }));
    group.appendChild(svgElement('circle', { class: 'hero-orbit-speck__core', r: definition.radius }));
    backBodyLayer.appendChild(group);
    return { definition: definition, group: group };
  }

  function renderSpeck(body, elapsed) {
    var definition = body.definition;
    var orbit = orbitDefinitions[definition.orbit];
    var meanAnomaly = definition.phase + elapsed / orbit.period * TAU;
    var state = ellipticState(orbit, meanAnomaly);
    var maximumDepth = orbit.a * Math.sin(orbit.inclination);
    var depth = Math.max(0, Math.min(1, (state.z / maximumDepth + 1) / 2));
    var scale = 0.8 + depth * 0.3;
    var layer = state.z >= 0 ? frontBodyLayer : backBodyLayer;

    if (body.group.parentNode !== layer) layer.appendChild(body.group);
    body.group.setAttribute('transform', 'translate(' + (CENTER + state.x).toFixed(2) + ' ' + (CENTER + state.y).toFixed(2) + ') scale(' + scale.toFixed(3) + ')');
    body.group.style.opacity = String(0.42 + depth * 0.5);
  }

  function buildAsteroid() {
    var group = svgElement('g', { class: 'hero-orbit-event hero-orbit-event--asteroid' });
    group.appendChild(svgElement('path', { class: 'hero-orbit-event__trail-soft', d: 'M -34 0 L -10 0' }));
    group.appendChild(svgElement('path', { class: 'hero-orbit-event__trail', d: 'M -21 0 L -8.5 0' }));

    var tumbler = svgElement('g', { class: 'hero-orbit-event__tumbler' });
    var base = between(5.4, 7.6);
    var vertexCount = 9;
    var points = [];
    for (var i = 0; i < vertexCount; i += 1) {
      var angle = TAU * i / vertexCount;
      var reach = base * between(0.7, 1.12);
      points.push([Math.cos(angle) * reach, Math.sin(angle) * reach]);
    }
    var previous = points[vertexCount - 1];
    var rockPath = 'M ' + ((previous[0] + points[0][0]) / 2).toFixed(2) + ' ' + ((previous[1] + points[0][1]) / 2).toFixed(2);
    for (var j = 0; j < vertexCount; j += 1) {
      var vertex = points[j];
      var next = points[(j + 1) % vertexCount];
      rockPath += ' Q ' + vertex[0].toFixed(2) + ' ' + vertex[1].toFixed(2)
        + ' ' + ((vertex[0] + next[0]) / 2).toFixed(2) + ' ' + ((vertex[1] + next[1]) / 2).toFixed(2);
    }
    tumbler.appendChild(svgElement('path', { class: 'hero-orbit-event__asteroid', d: rockPath + ' Z' }));

    var craterCount = random() < 0.5 ? 2 : 3;
    for (var k = 0; k < craterCount; k += 1) {
      var craterAngle = between(0, TAU);
      var craterDistance = base * between(0.12, 0.42);
      tumbler.appendChild(svgElement('circle', {
        class: 'hero-orbit-event__crater',
        cx: (Math.cos(craterAngle) * craterDistance).toFixed(2),
        cy: (Math.sin(craterAngle) * craterDistance).toFixed(2),
        r: (base * between(0.14, 0.24)).toFixed(2),
      }));
    }
    group.appendChild(tumbler);
    return { group: group, tumbler: tumbler };
  }

  function buildRocket() {
    var group = svgElement('g', { class: 'hero-orbit-event hero-orbit-event--rocket' });
    group.appendChild(svgElement('path', { class: 'hero-orbit-event__plume', d: 'M -27 0 L -9.5 0' }));
    group.appendChild(svgElement('path', { class: 'hero-orbit-event__plume-core', d: 'M -17 0 L -8.5 0' }));
    group.appendChild(svgElement('path', { class: 'hero-orbit-event__rocket-fin', d: 'M -3.6 -2.5 L -9.6 -6.4 L -6.8 -0.9 Z M -3.6 2.5 L -9.6 6.4 L -6.8 0.9 Z' }));
    group.appendChild(svgElement('path', { class: 'hero-orbit-event__rocket-body', d: 'M 12.5 0 C 9.6 -2.9 3.6 -3.5 -3.4 -2.7 L -8 -1.6 L -8 1.6 L -3.4 2.7 C 3.6 3.5 9.6 2.9 12.5 0 Z' }));
    group.appendChild(svgElement('path', { class: 'hero-orbit-event__engine', d: 'M -8 -1.8 L -9.9 -1.15 L -9.9 1.15 L -8 1.8 Z' }));
    group.appendChild(svgElement('ellipse', { class: 'hero-orbit-event__window', cx: 5.7, cy: -0.5, rx: 2, ry: 1.05 }));
    return group;
  }

  function createAsteroidEvent(startTime) {
    var eccentricity = between(1.2, 1.8);
    var periapsis = between(130, 190);
    var semiMajor = periapsis / (eccentricity - 1);
    var farRadius = between(760, 900);
    var meanLimit = hyperbolicMeanAtRadius(semiMajor, eccentricity, farRadius);
    var art = buildAsteroid();
    return {
      type: 'asteroid',
      group: art.group,
      tumbler: art.tumbler,
      elements: {
        a: semiMajor,
        e: eccentricity,
        inclination: between(58, 76) * DEG,
        node: between(-22, 14) * DEG,
      },
      meanStart: -meanLimit,
      meanEnd: meanLimit,
      startTime: startTime,
      duration: between(9, 12),
      spin: between(-34, 34),
      size: between(0.85, 1.2),
    };
  }

  function createRocketEvent(startTime) {
    // Hyperbolic pass, like the asteroids: enter off-scene, round the star
    // at a safe distance, and exit off-scene — never fading out mid-frame.
    var eccentricity = between(1.15, 1.4);
    var periapsis = between(215, 265);
    var semiMajor = periapsis / (eccentricity - 1);
    var farRadius = between(1100, 1300);
    var meanLimit = hyperbolicMeanAtRadius(semiMajor, eccentricity, farRadius);
    return {
      type: 'rocket',
      group: buildRocket(),
      elements: {
        a: semiMajor,
        e: eccentricity,
        inclination: between(58, 68) * DEG,
        node: between(-18, 12) * DEG,
      },
      meanStart: -meanLimit,
      meanEnd: meanLimit,
      startTime: startTime,
      duration: between(10, 13),
      spin: 0,
      size: between(0.9, 1.15),
    };
  }

  function createEvent(startTime) {
    var event = random() < 0.7 ? createAsteroidEvent(startTime) : createRocketEvent(startTime);
    event.group.dataset.orbitEvent = event.type;
    backEventLayer.appendChild(event.group);
    scene.dataset.activeEvent = event.type;
    return event;
  }

  function renderEvent(event, elapsed) {
    var progress = (elapsed - event.startTime) / event.duration;
    if (progress >= 1) return false;
    var mean = event.meanStart + (event.meanEnd - event.meanStart) * Math.max(0, progress);
    var state = hyperbolicState(event.elements, mean);
    var heading = velocityHeading(state) / DEG;
    var fade = Math.min(1, progress / 0.09, (1 - progress) / 0.12);
    var depthRange = event.elements.a * Math.sin(event.elements.inclination);
    var depth = Math.max(0, Math.min(1, (state.z / depthRange + 1) / 2));
    var scale = (0.82 + depth * 0.22) * (event.size || 1);
    var layer = state.z >= 0 ? frontEventLayer : backEventLayer;

    if (event.group.parentNode !== layer) layer.appendChild(event.group);
    event.group.setAttribute('transform', 'translate(' + (CENTER + state.x).toFixed(2) + ' ' + (CENTER + state.y).toFixed(2) + ') rotate(' + heading.toFixed(2) + ') scale(' + scale.toFixed(3) + ')');
    event.group.style.opacity = String(Math.max(0, fade * (0.72 + depth * 0.24)));

    if (event.tumbler) {
      event.tumbler.setAttribute('transform', 'rotate(' + (event.spin * (elapsed - event.startTime)).toFixed(2) + ')');
    }
    return true;
  }

  orbitDefinitions.forEach(buildOrbitPath);
  var bodies = speckDefinitions.map(buildSpeck);
  var elapsed = 0;
  var lastTimestamp = 0;
  var activeEvent = null;
  var nextEventAt = between(8, 12);
  var inViewport = true;
  var frameRequest = 0;

  function syncVisibilityState() {
    lastTimestamp = 0;
    if (document.hidden || reducedMotion) scene.dataset.motionState = 'paused';
  }

  function render(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    var delta = Math.min(0.1, Math.max(0, (timestamp - lastTimestamp) / 1000));
    lastTimestamp = timestamp;
    var active = inViewport && !document.hidden;

    if (active && !reducedMotion) elapsed += delta;
    bodies.forEach(function (body) { renderSpeck(body, elapsed); });

    if (active && !reducedMotion) {
      if (!activeEvent && elapsed >= nextEventAt) activeEvent = createEvent(elapsed);
      if (activeEvent && !renderEvent(activeEvent, elapsed)) {
        activeEvent.group.remove();
        activeEvent = null;
        delete scene.dataset.activeEvent;
        nextEventAt = elapsed + between(18, 30);
      }
    }

    scene.dataset.motionState = active && !reducedMotion ? 'running' : 'paused';
    frameRequest = window.requestAnimationFrame(render);
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      inViewport = Boolean(entries[0] && entries[0].isIntersecting);
    }, { threshold: 0.04 });
    observer.observe(scene);
  }

  document.addEventListener('visibilitychange', syncVisibilityState);

  bodies.forEach(function (body) { renderSpeck(body, 0); });
  if (!reducedMotion) frameRequest = window.requestAnimationFrame(render);
  else scene.dataset.motionState = 'paused';

  window.addEventListener('pagehide', function () {
    if (frameRequest) window.cancelAnimationFrame(frameRequest);
    if (typeof observer !== 'undefined') observer.disconnect();
    document.removeEventListener('visibilitychange', syncVisibilityState);
  }, { once: true });
}

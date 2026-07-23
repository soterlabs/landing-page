export const TAU = Math.PI * 2;

const DEFAULT_TOLERANCE = 1e-10;
const DEFAULT_ITERATIONS = 18;

export function normalizeAngle(angle) {
  var value = angle % TAU;
  return value < 0 ? value + TAU : value;
}

export function solveEllipticAnomaly(meanAnomaly, eccentricity, tolerance = DEFAULT_TOLERANCE) {
  if (eccentricity < 0 || eccentricity >= 1) throw new RangeError('Elliptic eccentricity must be in [0, 1).');
  var mean = normalizeAngle(meanAnomaly);
  var anomaly = eccentricity < 0.8 ? mean : Math.PI;

  for (var i = 0; i < DEFAULT_ITERATIONS; i += 1) {
    var residual = anomaly - eccentricity * Math.sin(anomaly) - mean;
    var derivative = 1 - eccentricity * Math.cos(anomaly);
    var step = residual / derivative;
    anomaly -= step;
    if (Math.abs(step) <= tolerance) break;
  }

  return anomaly;
}

export function solveHyperbolicAnomaly(meanAnomaly, eccentricity, tolerance = DEFAULT_TOLERANCE) {
  if (eccentricity <= 1) throw new RangeError('Hyperbolic eccentricity must be greater than 1.');
  var anomaly = Math.asinh(meanAnomaly / eccentricity);

  for (var i = 0; i < DEFAULT_ITERATIONS; i += 1) {
    var sinh = Math.sinh(anomaly);
    var cosh = Math.cosh(anomaly);
    var residual = eccentricity * sinh - anomaly - meanAnomaly;
    var derivative = eccentricity * cosh - 1;
    var step = residual / derivative;
    anomaly -= step;
    if (Math.abs(step) <= tolerance) break;
  }

  return anomaly;
}

export function projectOrbitalState(state, inclination, node) {
  var cosInclination = Math.cos(inclination);
  var sinInclination = Math.sin(inclination);
  var cosNode = Math.cos(node);
  var sinNode = Math.sin(node);
  var flattenedY = state.y * cosInclination;
  var flattenedVelocityY = state.vy * cosInclination;

  return {
    x: state.x * cosNode - flattenedY * sinNode,
    y: state.x * sinNode + flattenedY * cosNode,
    z: state.y * sinInclination,
    vx: state.vx * cosNode - flattenedVelocityY * sinNode,
    vy: state.vx * sinNode + flattenedVelocityY * cosNode,
    vz: state.vy * sinInclination,
  };
}

export function ellipticStateAtAnomaly(elements, eccentricAnomaly) {
  var a = elements.a;
  var e = elements.e;
  var root = Math.sqrt(1 - e * e);
  var denominator = 1 - e * Math.cos(eccentricAnomaly);
  var state = {
    x: a * (Math.cos(eccentricAnomaly) - e),
    y: a * root * Math.sin(eccentricAnomaly),
    vx: -a * Math.sin(eccentricAnomaly) / denominator,
    vy: a * root * Math.cos(eccentricAnomaly) / denominator,
  };
  return projectOrbitalState(state, elements.inclination, elements.node);
}

export function ellipticState(elements, meanAnomaly) {
  return ellipticStateAtAnomaly(elements, solveEllipticAnomaly(meanAnomaly, elements.e));
}

export function hyperbolicState(elements, meanAnomaly) {
  var anomaly = solveHyperbolicAnomaly(meanAnomaly, elements.e);
  var a = elements.a;
  var e = elements.e;
  var root = Math.sqrt(e * e - 1);
  var denominator = e * Math.cosh(anomaly) - 1;
  var state = {
    x: a * (e - Math.cosh(anomaly)),
    y: a * root * Math.sinh(anomaly),
    vx: -a * Math.sinh(anomaly) / denominator,
    vy: a * root * Math.cosh(anomaly) / denominator,
  };
  return projectOrbitalState(state, elements.inclination, elements.node);
}

export function orbitalRadius(state) {
  return Math.hypot(state.x, state.y, state.z);
}

export function velocityHeading(state) {
  return Math.atan2(state.vy, state.vx);
}

export function hyperbolicMeanAtRadius(a, eccentricity, radius) {
  var coshAnomaly = Math.max(1, (radius / a + 1) / eccentricity);
  var anomaly = Math.acosh(coshAnomaly);
  return eccentricity * Math.sinh(anomaly) - anomaly;
}

export function createSeededRandom(seed) {
  var value = seed >>> 0;
  return function random() {
    value += 0x6D2B79F5;
    var result = value;
    result = Math.imul(result ^ result >>> 15, result | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TAU,
  createSeededRandom,
  ellipticState,
  hyperbolicState,
  orbitalRadius,
  velocityHeading,
} from '../public/assets/js/orbit-math.js';

const DEG = Math.PI / 180;

test('elliptic orbit closes without a position discontinuity', () => {
  const elements = { a: 315, e: 0.09, inclination: 71 * DEG, node: 8 * DEG };
  const start = ellipticState(elements, 0);
  const end = ellipticState(elements, TAU);
  assert.ok(Math.hypot(start.x - end.x, start.y - end.y, start.z - end.z) < 1e-8);
});

test('all configured elliptic planes remain prograde', () => {
  const planes = [
    { a: 230, e: 0.05, inclination: 68 * DEG, node: -8 * DEG },
    { a: 315, e: 0.09, inclination: 71 * DEG, node: 8 * DEG },
    { a: 395, e: 0.13, inclination: 74 * DEG, node: -15 * DEG },
  ];

  planes.forEach((elements) => {
    for (let index = 0; index < 96; index += 1) {
      const state = ellipticState(elements, TAU * index / 96);
      assert.ok(state.x * state.vy - state.y * state.vx > 0);
    }
  });
});

test('elliptic position and tangent remain continuous around a full orbit', () => {
  const elements = { a: 395, e: 0.13, inclination: 74 * DEG, node: -15 * DEG };
  let previousState = ellipticState(elements, 0);
  let previousHeading = velocityHeading(previousState);

  for (let index = 1; index <= 240; index += 1) {
    const state = ellipticState(elements, TAU * index / 240);
    const heading = velocityHeading(state);
    const headingDelta = Math.atan2(
      Math.sin(heading - previousHeading),
      Math.cos(heading - previousHeading),
    );

    assert.ok(Math.hypot(state.x - previousState.x, state.y - previousState.y) < 28);
    assert.ok(Math.abs(headingDelta) < 0.12);
    previousState = state;
    previousHeading = heading;
  }
});

test('hyperbolic distance has exactly one periapsis', () => {
  const elements = { a: 250, e: 1.55, inclination: 66 * DEG, node: -12 * DEG };
  const samples = Array.from({ length: 121 }, (_, index) => {
    const mean = -3 + index * 0.05;
    return { mean, radius: orbitalRadius(hyperbolicState(elements, mean)) };
  });
  const midpoint = 60;

  for (let index = 1; index <= midpoint; index += 1) {
    assert.ok(samples[index].radius < samples[index - 1].radius);
  }
  for (let index = midpoint + 1; index < samples.length; index += 1) {
    assert.ok(samples[index].radius > samples[index - 1].radius);
  }
});

test('hyperbolic heading changes continuously through periapsis', () => {
  const elements = { a: 250, e: 1.55, inclination: 66 * DEG, node: -12 * DEG };
  let previous = velocityHeading(hyperbolicState(elements, -2.5));

  for (let index = 1; index <= 200; index += 1) {
    const mean = -2.5 + index * 0.025;
    const heading = velocityHeading(hyperbolicState(elements, mean));
    const delta = Math.atan2(Math.sin(heading - previous), Math.cos(heading - previous));
    // The projected tangent turns most quickly immediately after periapsis,
    // but should never jump or reverse between adjacent samples.
    assert.ok(Math.abs(delta) < 0.11);
    previous = heading;
  }
});

test('seeded random sequence is deterministic per page seed', () => {
  const first = createSeededRandom(42024);
  const second = createSeededRandom(42024);
  assert.deepEqual(
    Array.from({ length: 8 }, () => first()),
    Array.from({ length: 8 }, () => second()),
  );
});

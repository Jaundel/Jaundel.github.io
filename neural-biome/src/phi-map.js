/**
 * phi-map.js
 *
 * Maps phi in [0, 1] to control tuples (kGate, tau, threshold) using
 * monotone cubic (PCHIP) interpolation through six calibrated waypoints.
 *
 * Waypoint order: Frozen → Territorial → Edge of Chaos → Flicker-Mixing → Chaotic → Cooperative
 *
 * Phi positions are arc-length parameterized: equal phi distance corresponds
 * to equal normalized Euclidean distance in (kGate, tau, threshold) space,
 * so the slider moves at a constant speed through the parameter landscape.
 */

const REGIME_META = [
  {
    phi: 0.00,
    label: 'Frozen',
    shortLabel: 'frozen',
    color: '#7a8794',
    description: 'High gate sharpness locks cells in their initial state. Patches hold; borders never form because species never meet.',
  },
  {
    phi: 0.27,
    label: 'Territorial',
    shortLabel: 'territorial',
    color: '#d86c4a',
    description: 'Species expand along patch edges and stabilize at contested fronts. Map structure mostly fixed once borders equilibrate.',
  },
  {
    phi: 0.43,
    label: 'Edge of Chaos',
    shortLabel: 'edge',
    color: '#d5a21f',
    description: 'Structured fronts keep moving without dissolving. Complexity is sustained: neither frozen nor random.',
  },
  {
    phi: 0.65,
    label: 'Flicker-Mixing',
    shortLabel: 'flicker',
    color: '#5586d9',
    description: 'Near-zero temperature creates a near-hardmax winner. Any scoring edge causes rapid local takeover and quick reversal.',
  },
  {
    phi: 0.85,
    label: 'Chaotic',
    shortLabel: 'chaos',
    color: '#8d5bd1',
    description: 'Very soft gating allows unconstrained growth and collapse. No persistent spatial structure; entropy near maximum.',
  },
  {
    phi: 1.00,
    label: 'Cooperative',
    shortLabel: 'coop',
    color: '#1f9d70',
    description: 'High temperature softens selection; multiple species share space without exclusion. Patches become polychromatic.',
  },
];

// Parameters at each waypoint, in the same order as REGIME_META.
// kGate is monotonically decreasing from Frozen to Chaotic, then recovers slightly at Cooperative.
// tau forms a U-shape: high at both ends (Frozen, Cooperative), minimum at Flicker-Mixing.
const RULE_PARAMS = [
  { kGate: 20.0, tau: 1.00, threshold: 0.55 },  // Frozen
  { kGate: 11.5, tau: 0.55, threshold: 0.48 },  // Territorial
  { kGate:  3.8, tau: 0.42, threshold: 0.46 },  // Edge of Chaos
  { kGate:  2.8, tau: 0.08, threshold: 0.36 },  // Flicker-Mixing
  { kGate:  2.2, tau: 0.62, threshold: 0.38 },  // Chaotic
  { kGate:  3.5, tau: 1.00, threshold: 0.39 },  // Cooperative
];

const LEARNED_PARAMS = [
  { kGate: 20.0, tau: 1.00, threshold: 0.55 },  // Frozen
  { kGate:  3.45, tau: 0.32, threshold: 0.53 }, // Territorial
  { kGate:  2.65, tau: 0.44, threshold: 0.49 }, // Edge of Chaos
  { kGate:  1.55, tau: 0.09, threshold: 0.38 }, // Flicker-Mixing
  { kGate:  0.95, tau: 1.75, threshold: 0.43 }, // Chaotic
  { kGate:  2.10, tau: 1.35, threshold: 0.31 }, // Cooperative
];

const PARAMS_BY_MODE = { rule: RULE_PARAMS, learned: LEARNED_PARAMS };

// ---------------------------------------------------------------------------
// PCHIP: Monotone Piecewise Cubic Hermite Interpolating Polynomial
//
// Guarantees C1 continuity (smooth first derivative) and preserves monotone
// segments, with no overshoot into negative kGate or tau values.
// Implements the Fritsch-Carlson (1980) slope selection algorithm.
// ---------------------------------------------------------------------------

function pchipSlopes(xs, ys) {
  const n = xs.length;
  const h = new Array(n - 1);
  const delta = new Array(n - 1);

  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i];
    delta[i] = (ys[i + 1] - ys[i]) / h[i];
  }

  const m = new Array(n);
  m[0] = delta[0];
  m[n - 1] = delta[n - 2];

  for (let i = 1; i < n - 1; i++) {
    if (delta[i - 1] * delta[i] <= 0) {
      // Sign change or zero: place slope at local extremum exactly.
      m[i] = 0;
    } else {
      // Weighted harmonic mean of adjacent secant slopes.
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i]);
    }
  }

  // Fritsch-Carlson monotonicity constraint: clamp any interval that would
  // otherwise violate the convex-hull condition.
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(delta[i]) < 1e-12) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const alpha = m[i] / delta[i];
    const beta = m[i + 1] / delta[i];
    const hyp = alpha * alpha + beta * beta;
    if (hyp > 9) {
      const scale = 3 / Math.sqrt(hyp);
      m[i] = scale * alpha * delta[i];
      m[i + 1] = scale * beta * delta[i];
    }
  }

  return m;
}

function cubicHermite(t, y0, y1, m0, m1, h) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * y0 +
    (t3 - 2 * t2 + t) * h * m0 +
    (-2 * t3 + 3 * t2) * y1 +
    (t3 - t2) * h * m1
  );
}

// ---------------------------------------------------------------------------
// Curve building and evaluation
// ---------------------------------------------------------------------------

function waypointsForMode(mode = 'rule') {
  const params = PARAMS_BY_MODE[mode] || RULE_PARAMS;
  return REGIME_META.map((meta, index) => ({ ...meta, ...params[index], mode }));
}

function buildCurve(waypoints) {
  const phis = waypoints.map((w) => w.phi);
  const kGates = waypoints.map((w) => w.kGate);
  const taus = waypoints.map((w) => w.tau);
  const thresholds = waypoints.map((w) => w.threshold);
  return {
    phis,
    kGates,
    taus,
    thresholds,
    kGateSlopes: pchipSlopes(phis, kGates),
    tauSlopes: pchipSlopes(phis, taus),
    thresholdSlopes: pchipSlopes(phis, thresholds),
  };
}

// Precompute curves at module load time. Waypoints are static constants.
const CURVES = {
  rule: buildCurve(waypointsForMode('rule')),
  learned: buildCurve(waypointsForMode('learned')),
};

function evalCurve(curve, phi) {
  const { phis, kGates, taus, thresholds, kGateSlopes, tauSlopes, thresholdSlopes } = curve;
  const n = phis.length;

  if (phi <= phis[0]) return { kGate: kGates[0], tau: taus[0], threshold: thresholds[0] };
  if (phi >= phis[n - 1]) return { kGate: kGates[n - 1], tau: taus[n - 1], threshold: thresholds[n - 1] };

  let i = 0;
  while (i < n - 2 && phis[i + 1] <= phi) i++;

  const h = phis[i + 1] - phis[i];
  const t = (phi - phis[i]) / h;

  return {
    kGate: Math.max(0.1, cubicHermite(t, kGates[i], kGates[i + 1], kGateSlopes[i], kGateSlopes[i + 1], h)),
    tau: Math.max(0.01, cubicHermite(t, taus[i], taus[i + 1], tauSlopes[i], tauSlopes[i + 1], h)),
    threshold: cubicHermite(t, thresholds[i], thresholds[i + 1], thresholdSlopes[i], thresholdSlopes[i + 1], h),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function activeWaypoint(phi, waypoints) {
  let best = waypoints[0];
  let bestDist = Math.abs(phi - best.phi);
  for (const wp of waypoints) {
    const d = Math.abs(phi - wp.phi);
    if (d < bestDist) {
      best = wp;
      bestDist = d;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function phiToParams(phiInput, mode = 'rule') {
  const phi = clamp01(Number(phiInput));
  const waypoints = waypointsForMode(mode);
  const active = activeWaypoint(phi, waypoints);
  const curve = CURVES[mode] || CURVES.rule;
  const { kGate, tau, threshold } = evalCurve(curve, phi);
  return {
    phi,
    label: active.label,
    shortLabel: active.shortLabel,
    color: active.color,
    description: active.description,
    mode,
    kGate,
    tau,
    threshold,
  };
}

export function getWaypoints(mode = 'rule') {
  return waypointsForMode(mode).map((wp) => ({ ...wp }));
}

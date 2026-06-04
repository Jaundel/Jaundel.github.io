/**
 * nca.js
 *
 * Prototype local simulation engine retained as development history.
 * The public article now uses learned-nca.js.
 */

export const N_SPECIES = 5;
export const SPECIES_COLORS = [
  [255, 80, 80],
  [80, 160, 255],
  [80, 220, 120],
  [255, 200, 50],
  [200, 80, 255],
];

const TWO_PI = Math.PI * 2;
const EPSILON = 1e-6;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(value) {
  if (value < -30) return 0;
  if (value > 30) return 1;
  return 1 / (1 + Math.exp(-value));
}

function wrap(value, size) {
  if (value < 0) return size - 1;
  if (value >= size) return 0;
  return value;
}

export class NCAGrid {
  constructor(width, height) {
    this.W = width;
    this.H = height;
    this.stepCount = 0;

    this.kGate = 20;
    this.tau = 1.0;
    this.threshold = 0.5;

    this.alive = new Float32Array(height * width * N_SPECIES);
    this.next = new Float32Array(height * width * N_SPECIES);
    this.attack = new Float32Array(N_SPECIES * 2);
    this.defense = new Float32Array(N_SPECIES * 2);

    this._initPersonalities();
    this._initGrid();
  }

  _idx(x, y, species) {
    return (y * this.W + x) * N_SPECIES + species;
  }

  _initPersonalities() {
    for (let i = 0; i < N_SPECIES; i++) {
      const attackAngle = (TWO_PI * i) / N_SPECIES;
      const defenseAngle = attackAngle + Math.PI / N_SPECIES;
      const offset = i * 2;

      this.attack[offset] = Math.cos(attackAngle);
      this.attack[offset + 1] = Math.sin(attackAngle);
      this.defense[offset] = Math.cos(defenseAngle);
      this.defense[offset + 1] = Math.sin(defenseAngle);
    }
  }

  _initGrid() {
    this.alive.fill(0);
    this.next.fill(0);
    this.stepCount = 0;

    const cx = (this.W - 1) / 2;
    const cy = (this.H - 1) / 2;
    const radius = Math.min(this.W, this.H) * 0.28;
    const patchRadius = Math.max(2, Math.floor(Math.min(this.W, this.H) * 0.055));

    for (let species = 0; species < N_SPECIES; species++) {
      const angle = -Math.PI / 2 + (TWO_PI * species) / N_SPECIES;
      const seedX = Math.round(cx + Math.cos(angle) * radius);
      const seedY = Math.round(cy + Math.sin(angle) * radius);

      for (let dy = -patchRadius; dy <= patchRadius; dy++) {
        for (let dx = -patchRadius; dx <= patchRadius; dx++) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > patchRadius) continue;

          const x = wrap(seedX + dx, this.W);
          const y = wrap(seedY + dy, this.H);
          const falloff = 1 - distance / (patchRadius + 1);
          this.alive[this._idx(x, y, species)] = 0.55 + falloff * 0.4;
        }
      }
    }
  }

  reset() {
    this._initPersonalities();
    this._initGrid();
  }

  setParams(kGate, tau, threshold) {
    this.kGate = kGate;
    this.tau = Math.max(0.05, tau);
    this.threshold = threshold;
  }

  step() {
    const pooled = new Float32Array(N_SPECIES);
    const avg = new Float32Array(N_SPECIES);
    const scores = new Float32Array(N_SPECIES);
    const weights = new Float32Array(N_SPECIES);

    const frozen = clamp((this.kGate - 12) / 8, 0, 1);
    const softActivity = clamp((8 - this.kGate) / 4, 0, 1);
    const cooperative = clamp((0.5 - this.threshold) / 0.12, 0, 1);
    const flicker = clamp((0.45 - this.tau) / 0.35, 0, 1);
    const decay = 0.035 + softActivity * 0.025 + flicker * 0.08 - frozen * 0.018 - cooperative * 0.012;
    const lr = 0.18 + softActivity * 0.12 + cooperative * 0.12 + flicker * 0.16 - frozen * 0.06;
    const noise = softActivity * 0.012 + flicker * 0.045;

    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        pooled.fill(0);
        avg.fill(0);

        for (let dy = -1; dy <= 1; dy++) {
          const yy = wrap(y + dy, this.H);
          for (let dx = -1; dx <= 1; dx++) {
            const xx = wrap(x + dx, this.W);
            const base = (yy * this.W + xx) * N_SPECIES;

            for (let species = 0; species < N_SPECIES; species++) {
              const value = this.alive[base + species];
              if (value > pooled[species]) pooled[species] = value;
              avg[species] += value / 9;
            }
          }
        }

        let defenseX = 0;
        let defenseY = 0;
        let localTotal = 0;

        for (let species = 0; species < N_SPECIES; species++) {
          localTotal += avg[species];
          const offset = species * 2;
          defenseX += this.defense[offset] * avg[species];
          defenseY += this.defense[offset + 1] * avg[species];
        }

        const defenseNorm = Math.sqrt(defenseX * defenseX + defenseY * defenseY) + EPSILON;
        let maxScore = -Infinity;

        for (let species = 0; species < N_SPECIES; species++) {
          if (pooled[species] <= 0.035) {
            scores[species] = -Infinity;
            continue;
          }

          const offset = species * 2;
          const affinity = (this.attack[offset] * defenseX + this.attack[offset + 1] * defenseY) / defenseNorm;
          const coexistence = Math.max(0, localTotal - avg[species]);
          const territory = avg[species] - coexistence * 0.32;

          scores[species] =
            affinity * 0.55 +
            territory * (1.2 - cooperative * 0.55) +
            coexistence * cooperative * 0.75;

          if (scores[species] > maxScore) maxScore = scores[species];
        }

        let scoreTotal = 0;
        for (let species = 0; species < N_SPECIES; species++) {
          if (!Number.isFinite(scores[species])) {
            weights[species] = 0;
            continue;
          }

          weights[species] = Math.exp((scores[species] - maxScore) / this.tau);
          scoreTotal += weights[species];
        }

        const cellBase = (y * this.W + x) * N_SPECIES;
        for (let species = 0; species < N_SPECIES; species++) {
          weights[species] /= scoreTotal || 1;

          const current = this.alive[cellBase + species];
          const gate = sigmoid(this.kGate * (pooled[species] - this.threshold));
          const present = pooled[species] > 0.035 ? 1 : 0;
          const growth = (avg[species] * 0.86 + current * 0.14) * weights[species] * gate * present;
          const crowding = Math.max(0, localTotal - avg[species]) * (1 - weights[species]) * 0.028;
          const jitter = (Math.random() - 0.5) * noise * gate * present;

          this.next[cellBase + species] = clamp(current * (1 - decay) + growth * lr - crowding + jitter, 0, 1);
        }
      }
    }

    const swap = this.alive;
    this.alive = this.next;
    this.next = swap;
    this.stepCount++;
  }

  getPopulations() {
    const populations = new Float32Array(N_SPECIES);
    const cells = this.W * this.H;

    for (let index = 0; index < this.alive.length; index += N_SPECIES) {
      for (let species = 0; species < N_SPECIES; species++) {
        populations[species] += this.alive[index + species] / cells;
      }
    }

    return populations;
  }

  getDiversity() {
    const populations = this.getPopulations();
    let total = 0;
    let entropy = 0;

    for (const population of populations) total += population;
    if (total <= EPSILON) return 0;

    for (const population of populations) {
      const p = population / total;
      if (p > EPSILON) entropy -= p * Math.log(p);
    }

    return entropy / Math.log(N_SPECIES);
  }
}

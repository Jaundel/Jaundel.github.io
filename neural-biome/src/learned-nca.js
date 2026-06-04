/**
 * learned-nca.js
 *
 * Adaptive engine. It keeps the renderer/chart contract, but replaces fixed
 * species personalities with per-cell attack/defense vectors that are
 * periodically updated by TensorFlow.js.
 */

import { N_SPECIES } from './nca.js';
import { loadTensorFlow } from './tf-loader.js';

const TWO_PI = Math.PI * 2;
const EPSILON = 1e-6;
const LEARN_EVERY = 4;

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

function normalizeVectorField(field) {
  for (let i = 0; i < field.length; i += 2) {
    const x = field[i];
    const y = field[i + 1];
    const norm = Math.sqrt(x * x + y * y) + EPSILON;
    field[i] = x / norm;
    field[i + 1] = y / norm;
  }
}

export class LearnedNCAGrid {
  constructor(width, height) {
    this.W = width;
    this.H = height;
    this.stepCount = 0;

    this.kGate = 20;
    this.tau = 1.0;
    this.threshold = 0.5;
    this.learningRate = 0.025;
    this.diversityWeight = 0.08;
    this.loss = null;
    this.status = 'loading';
    this.statusMessage = 'loading TF.js';

    this.alive = new Float32Array(height * width * N_SPECIES);
    this.next = new Float32Array(height * width * N_SPECIES);
    this.attackField = new Float32Array(height * width * N_SPECIES * 2);
    this.defenseField = new Float32Array(height * width * N_SPECIES * 2);
    this.pooled = new Float32Array(N_SPECIES);
    this.avg = new Float32Array(N_SPECIES);
    this.scores = new Float32Array(N_SPECIES);
    this.weights = new Float32Array(N_SPECIES);
    this.fairnessBoost = new Float32Array(N_SPECIES);

    this._initPersonalities();
    this._initGrid();
    this._initTf();
  }

  _idx(x, y, species) {
    return (y * this.W + x) * N_SPECIES + species;
  }

  _vecIdx(x, y, species) {
    return ((y * this.W + x) * N_SPECIES + species) * 2;
  }

  _initPersonalities() {
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        for (let species = 0; species < N_SPECIES; species++) {
          const attackAngle = (TWO_PI * species) / N_SPECIES;
          const defenseAngle = attackAngle + Math.PI / N_SPECIES;
          const jitter = (Math.random() - 0.5) * 0.1;
          const offset = this._vecIdx(x, y, species);

          this.attackField[offset] = Math.cos(attackAngle + jitter);
          this.attackField[offset + 1] = Math.sin(attackAngle + jitter);
          this.defenseField[offset] = Math.cos(defenseAngle - jitter);
          this.defenseField[offset + 1] = Math.sin(defenseAngle - jitter);
        }
      }
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

  async _initTf() {
    try {
      this.tf = await loadTensorFlow();
      this.optimizer = this.tf.train.adam(this.learningRate);
      this.attackVar = this.tf.variable(this.tf.tensor(this.attackField, [this.H, this.W, N_SPECIES, 2]));
      this.defenseVar = this.tf.variable(this.tf.tensor(this.defenseField, [this.H, this.W, N_SPECIES, 2]));
      this.status = 'ready';
      this.statusMessage = 'learning on';
    } catch (error) {
      this.status = 'fallback';
      this.statusMessage = error.message;
    }
  }

  _syncVarsToCpu() {
    this.attackField.set(this.attackVar.dataSync());
    this.defenseField.set(this.defenseVar.dataSync());
    normalizeVectorField(this.attackField);
    normalizeVectorField(this.defenseField);
  }

  _learn() {
    if (this.status !== 'ready' || !this.tf) return;

    const tf = this.tf;
    const tau = Math.max(0.08, this.tau);
    // At high kGate (frozen regime) diversity enforcement would fight the intended dynamics, so scale it off.
    const mobilityFactor = Math.max(0, Math.min(1, (8 - this.kGate) / 8));
    const diversityWeight = this.diversityWeight * mobilityFactor;

    const lossTensor = this.optimizer.minimize(() => tf.tidy(() => {
      const alive = tf.tensor(this.alive, [this.H, this.W, N_SPECIES]);
      const localDefense = alive.expandDims(3).mul(this.defenseVar).sum(2);
      const defenseNorm = localDefense.square().sum(2, true).sqrt().add(EPSILON);
      const normalizedDefense = localDefense.div(defenseNorm).expandDims(2);
      const affinity = this.attackVar.mul(normalizedDefense).sum(3);
      const activity = alive.max(2);
      const energy = tf.logSumExp(affinity.div(tau), 2).mul(activity).mean().neg();

      const populations = alive.mean([0, 1]);
      const popTotal = populations.sum().add(EPSILON);
      const distribution = populations.div(popTotal);
      const entropy = distribution.add(EPSILON).log().mul(distribution).sum().neg().div(Math.log(N_SPECIES));

      const attackNorm = this.attackVar.square().sum(3).sub(1).square().mean();
      const defenseNormPenalty = this.defenseVar.square().sum(3).sub(1).square().mean();

      return energy.sub(entropy.mul(diversityWeight)).add(attackNorm.add(defenseNormPenalty).mul(0.02));
    }), true, [this.attackVar, this.defenseVar]);

    if (lossTensor) {
      this.loss = lossTensor.dataSync()[0];
      lossTensor.dispose();
    }

    const normalizedAttack = tf.tidy(() => {
      const norm = this.attackVar.square().sum(3, true).sqrt().add(EPSILON);
      return this.attackVar.div(norm);
    });
    const normalizedDefense = tf.tidy(() => {
      const norm = this.defenseVar.square().sum(3, true).sqrt().add(EPSILON);
      return this.defenseVar.div(norm);
    });
    this.attackVar.assign(normalizedAttack);
    this.defenseVar.assign(normalizedDefense);
    normalizedAttack.dispose();
    normalizedDefense.dispose();

    this._syncVarsToCpu();
  }

  reset() {
    this._initPersonalities();
    this._initGrid();
    this.loss = null;

    if (this.status === 'ready') {
      const tf = this.tf;
      tf.tidy(() => {
        this.attackVar.assign(tf.tensor(this.attackField, [this.H, this.W, N_SPECIES, 2]));
        this.defenseVar.assign(tf.tensor(this.defenseField, [this.H, this.W, N_SPECIES, 2]));
      });
    }
  }

  dispose() {
    this.attackVar?.dispose();
    this.defenseVar?.dispose();
  }

  setParams(kGate, tau, threshold) {
    this.kGate = kGate;
    this.tau = Math.max(0.05, tau);
    this.threshold = threshold;
  }

  step() {
    const pooled = this.pooled;
    const avg = this.avg;
    const scores = this.scores;
    const weights = this.weights;
    const fairnessBoost = this.fairnessBoost;

    const frozen = clamp((this.kGate - 12) / 8, 0, 1);
    const softActivity = clamp((8 - this.kGate) / 4, 0, 1);
    const cooperative = clamp((0.5 - this.threshold) / 0.12, 0, 1);
    const flicker = clamp((0.45 - this.tau) / 0.35, 0, 1);
    const mobility = clamp((12 - this.kGate) / 8, 0, 1);
    const temperatureInstability = clamp(Math.abs(this.tau - 0.8) / 0.8, 0, 1) * mobility * (1 - frozen);
    const lowTemperatureFocus = clamp((0.34 - this.tau) / 0.3, 0, 1) * mobility * (1 - frozen);
    const mobilityThreshold = this.threshold - mobility * 0.06;
    const decay = 0.036 + softActivity * 0.028 + flicker * 0.08 + temperatureInstability * 0.045 - frozen * 0.02 - cooperative * 0.012;
    const lr = 0.18 + softActivity * 0.13 + cooperative * 0.12 + flicker * 0.17 + temperatureInstability * 0.09 - frozen * 0.06;
    const noise = softActivity * 0.014 + flicker * 0.052 + mobility * 0.032 + temperatureInstability * 0.08;
    const selectionPressure = Math.max(0, 0.02 + mobility * 0.032 + flicker * 0.038 + temperatureInstability * 0.025 - cooperative * 0.012);
    const cellCapacity = 1.35 + cooperative * 0.62;
    const softmaxTau = Math.max(0.08, this.tau);
    const populations = this.getPopulations();
    const survivalShare = 0.055 + cooperative * 0.035;

    let populationTotal = 0;
    for (const population of populations) populationTotal += population;

    fairnessBoost.fill(0);
    if (populationTotal > EPSILON) {
      const fairnessStrength = (0.08 + cooperative * 0.045) * (1 - temperatureInstability * 0.5);
      for (let species = 0; species < N_SPECIES; species++) {
        const share = populations[species] / populationTotal;
        const deficit = Math.max(0, survivalShare - share) / survivalShare;
        fairnessBoost[species] = deficit * fairnessStrength;
      }
    }

    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        pooled.fill(0);
        avg.fill(0);

        let defenseX = 0;
        let defenseY = 0;

        for (let dy = -1; dy <= 1; dy++) {
          const yy = wrap(y + dy, this.H);
          for (let dx = -1; dx <= 1; dx++) {
            const xx = wrap(x + dx, this.W);
            const base = (yy * this.W + xx) * N_SPECIES;

            for (let species = 0; species < N_SPECIES; species++) {
              const value = this.alive[base + species];
              if (value > pooled[species]) pooled[species] = value;
              avg[species] += value / 9;

              const vecOffset = this._vecIdx(xx, yy, species);
              defenseX += this.defenseField[vecOffset] * value / 9;
              defenseY += this.defenseField[vecOffset + 1] * value / 9;
            }
          }
        }

        let localTotal = 0;
        for (let species = 0; species < N_SPECIES; species++) localTotal += avg[species];

        const defenseNorm = Math.sqrt(defenseX * defenseX + defenseY * defenseY) + EPSILON;
        let maxScore = -Infinity;

        for (let species = 0; species < N_SPECIES; species++) {
          if (pooled[species] <= 0.035) {
            scores[species] = -Infinity;
            continue;
          }

          const offset = this._vecIdx(x, y, species);
          const affinity = (this.attackField[offset] * defenseX + this.attackField[offset + 1] * defenseY) / defenseNorm;
          const coexistence = Math.max(0, localTotal - avg[species]);
          const territory = avg[species] - coexistence * 0.32;
          const localDominance = localTotal > EPSILON ? avg[species] / localTotal : 0;
          const winnerFatigue = localDominance * lowTemperatureFocus * 0.18;
          const exploratoryJitter = (Math.random() - 0.5) * temperatureInstability * 0.28;
          const turnoverJitter = (Math.random() - 0.5) * lowTemperatureFocus * 0.16;

          scores[species] =
            affinity * 0.55 +
            territory * (1.2 - cooperative * 0.55) +
            coexistence * cooperative * 0.75 * (1 - temperatureInstability * 0.6) +
            fairnessBoost[species] +
            exploratoryJitter +
            turnoverJitter -
            winnerFatigue;

          if (scores[species] > maxScore) maxScore = scores[species];
        }

        let scoreTotal = 0;
        for (let species = 0; species < N_SPECIES; species++) {
          if (!Number.isFinite(scores[species])) {
            weights[species] = 0;
            continue;
          }

          weights[species] = Math.exp((scores[species] - maxScore) / softmaxTau);
          scoreTotal += weights[species];
        }

        const cellBase = (y * this.W + x) * N_SPECIES;
        for (let species = 0; species < N_SPECIES; species++) {
          weights[species] /= scoreTotal || 1;

          const current = this.alive[cellBase + species];
          const gate = sigmoid(this.kGate * (pooled[species] - mobilityThreshold));
          const present = pooled[species] > 0.035 ? 1 : 0;
          const growth = (avg[species] * 0.86 + current * 0.14) * weights[species] * gate * present;
          const crowding = Math.max(0, localTotal - avg[species]) * (1 - weights[species]) * 0.018;
          const jitter = (Math.random() - 0.5) * noise * gate * present;
          const frontier = Math.max(0, pooled[species] - current);
          const mobilityDrive = frontier * gate * present * mobility * (0.23 + temperatureInstability * 0.08) * (0.4 + weights[species]);
          const preservationDrive = avg[species] * gate * present * fairnessBoost[species] * 0.22 * (1 - temperatureInstability * 0.72);

          this.next[cellBase + species] = clamp(
            current * (1 - decay) + growth * lr + mobilityDrive + preservationDrive - crowding + jitter,
            0,
            1,
          );
        }

        let nextTotal = 0;
        for (let species = 0; species < N_SPECIES; species++) {
          const loserShare = 1 - weights[species];
          this.next[cellBase + species] *= 1 - selectionPressure * loserShare;
          nextTotal += this.next[cellBase + species];
        }

        if (lowTemperatureFocus > 0 && nextTotal > EPSILON) {
          let focusedTotal = 0;
          const focusStrength = lowTemperatureFocus * 0.52;

          for (let species = 0; species < N_SPECIES; species++) {
            const focused = this.next[cellBase + species] * (1 - focusStrength + weights[species] * focusStrength * N_SPECIES);
            this.next[cellBase + species] = focused;
            focusedTotal += focused;
          }

          if (focusedTotal > EPSILON) {
            const preserveTotal = nextTotal / focusedTotal;
            for (let species = 0; species < N_SPECIES; species++) {
              this.next[cellBase + species] *= preserveTotal;
            }
            nextTotal = 0;
            for (let species = 0; species < N_SPECIES; species++) nextTotal += this.next[cellBase + species];
          }
        }

        if (nextTotal > cellCapacity) {
          const scale = cellCapacity / nextTotal;
          for (let species = 0; species < N_SPECIES; species++) {
            this.next[cellBase + species] *= scale;
          }
        }
      }
    }

    const swap = this.alive;
    this.alive = this.next;
    this.next = swap;
    this.stepCount++;

    if (this.stepCount % LEARN_EVERY === 0) this._learn();
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

  getLearningStatus() {
    return {
      mode: 'learned',
      status: this.status,
      message: this.statusMessage,
      loss: this.loss,
    };
  }
}

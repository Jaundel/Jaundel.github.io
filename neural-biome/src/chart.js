/**
 * chart.js
 *
 * Small dependency-free population timeline for the article header.
 */

import { N_SPECIES, SPECIES_COLORS } from './nca.js';

const HISTORY_LEN = 300;
const EPSILON = 1e-6;

function colorForSpecies(species, alpha = 1) {
  const [r, g, b] = SPECIES_COLORS[species];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function normalizedEntropy(populations) {
  let total = 0;
  let entropy = 0;

  for (let i = 0; i < N_SPECIES; i++) total += populations[i];
  if (total <= EPSILON) return 0;

  for (let i = 0; i < N_SPECIES; i++) {
    const p = populations[i] / total;
    if (p > EPSILON) entropy -= p * Math.log(p);
  }

  return entropy / Math.log(N_SPECIES);
}

export class PopulationChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.history = new Float32Array(HISTORY_LEN * N_SPECIES);
    this.entropy = new Float32Array(HISTORY_LEN);
    this.cursor = 0;
    this.count = 0;
  }

  reset() {
    this.history.fill(0);
    this.entropy.fill(0);
    this.cursor = 0;
    this.count = 0;
    this.draw();
  }

  push(populations) {
    const slot = this.cursor % HISTORY_LEN;
    const base = slot * N_SPECIES;

    for (let species = 0; species < N_SPECIES; species++) {
      this.history[base + species] = populations[species];
    }

    this.entropy[slot] = normalizedEntropy(populations);
    this.cursor++;
    this.count = Math.min(this.count + 1, HISTORY_LEN);
  }

  _slotAt(visibleIndex) {
    const start = this.count < HISTORY_LEN ? 0 : this.cursor % HISTORY_LEN;
    return (start + visibleIndex) % HISTORY_LEN;
  }

  draw() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const padX = 10;
    const padY = 10;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e7e7e7';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padY + (plotH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();
    }

    if (this.count < 2) return;

    const columnW = plotW / Math.max(1, this.count - 1);
    const stacks = Array.from({ length: this.count }, () => new Float32Array(N_SPECIES + 1));

    for (let i = 0; i < this.count; i++) {
      const slot = this._slotAt(i);
      const base = slot * N_SPECIES;
      let total = 0;

      for (let species = 0; species < N_SPECIES; species++) {
        total += this.history[base + species];
      }

      let cumulative = 0;
      stacks[i][0] = 0;
      for (let species = 0; species < N_SPECIES; species++) {
        const amount = total > EPSILON ? this.history[base + species] / total : 0;
        cumulative += amount * Math.min(1, total);
        stacks[i][species + 1] = cumulative;
      }
    }

    for (let species = 0; species < N_SPECIES; species++) {
      ctx.beginPath();

      for (let i = 0; i < this.count; i++) {
        const x = padX + i * columnW;
        const y = padY + plotH * (1 - stacks[i][species + 1]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      for (let i = this.count - 1; i >= 0; i--) {
        const x = padX + i * columnW;
        const y = padY + plotH * (1 - stacks[i][species]);
        ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fillStyle = colorForSpecies(species, 0.78);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(20, 20, 20, 0.72)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < this.count; i++) {
      const slot = this._slotAt(i);
      const x = padX + i * columnW;
      const y = padY + plotH * (1 - this.entropy[slot]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#444444';
    ctx.font = '11px Helvetica, Arial, sans-serif';
    ctx.fillText('population mix', padX, height - 4);
    ctx.fillText('diversity', width - 58, 14);
  }
}

/**
 * app.js
 *
 * Public article wiring. The demo uses the adaptive learned engine only; the
 * earlier rule engine remains in the repository as development history.
 */

import { phiToParams, getWaypoints } from './phi-map.js';
import { LearnedNCAGrid } from './learned-nca.js';
import { Renderer } from './renderer.js';
import { PopulationChart } from './chart.js';

const GRID_W = 64;
const GRID_H = 64;
const STEPS_PER_FRAME = 3;
const DEFAULT_PHI = 0.43;
const ENGINE_MODE = 'learned';

let phi = DEFAULT_PHI;
let frame = 0;

const ncaCanvas = document.querySelector('#nca-canvas');
const chartCanvas = document.querySelector('#chart-canvas');
if (!ncaCanvas || !chartCanvas) {
  throw new Error('Neural Biome requires #nca-canvas and #chart-canvas elements.');
}

const grid = new LearnedNCAGrid(GRID_W, GRID_H);
const renderer = new Renderer(ncaCanvas, GRID_W, GRID_H);
const chart = new PopulationChart(chartCanvas);
const slider = document.querySelector('#phi-slider');
const phiValue = document.querySelector('#phi-value');
const regimeLabel = document.querySelector('#regime-label');
const regimeDescription = document.querySelector('#regime-description');
const labelTrack = document.querySelector('.phi-track-labels');
const resetButton = document.querySelector('#reset-button');
const learningStatus = document.querySelector('#learning-status');
const researcherToggle = document.querySelector('#researcher-toggle');

const EXPECTED_BEHAVIOR = {
  Frozen: 'Static islands. Species persist because nothing meaningful reaches the frontier.',
  Territorial: 'Large territories form; borders move early, then mostly settle into contested fronts.',
  'Edge of Chaos': 'Persistent structure under pressure: cores remain visible while boundaries keep moving.',
  'Flicker-Mixing': 'Local winners switch rapidly; the system is mixed by time, not by stable sharing.',
  Chaotic: 'Structure keeps dissolving and reforming. Cooperative-looking patches should not last.',
  Cooperative: 'Multiple species share space in persistent, interleaved regions without immediate exclusion.',
};

function renderRegimeLabels() {
  if (!labelTrack) return;

  labelTrack.innerHTML = '';
  for (const waypoint of getWaypoints(ENGINE_MODE)) {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'zone-marker';
    marker.dataset.phi = String(waypoint.phi);
    marker.dataset.label = waypoint.label;
    marker.style.left = `${waypoint.phi * 100}%`;
    marker.style.setProperty('--zone-color', waypoint.color);
    marker.textContent = waypoint.shortLabel;
    marker.title = `${waypoint.label}: phi=${waypoint.phi.toFixed(2)}`;
    marker.addEventListener('click', () => setPhi(waypoint.phi, true));
    labelTrack.appendChild(marker);
  }
}

function updateRegimeUI(params) {
  if (phiValue) phiValue.textContent = phi.toFixed(2);

  if (regimeLabel) {
    regimeLabel.textContent = params.label;
    regimeLabel.style.backgroundColor = params.color;
    regimeLabel.style.borderColor = params.color;
  }

  if (regimeDescription) regimeDescription.textContent = params.description;
  if (!labelTrack) return;

  for (const marker of labelTrack.querySelectorAll('.zone-marker')) {
    marker.classList.toggle('is-active', marker.dataset.label === params.label);
  }
}

function setPhi(nextPhi, shouldReset = false) {
  phi = Math.max(0, Math.min(1, Number(nextPhi)));
  if (slider) slider.value = String(phi);

  const params = phiToParams(phi, ENGINE_MODE);
  grid.setParams(params.kGate, params.tau, params.threshold);
  updateRegimeUI(params);

  if (shouldReset) {
    grid.reset();
    chart.reset();
  }
}

function updateLearningStatus() {
  if (!learningStatus) return;

  const status = grid.getLearningStatus?.();
  if (!status) {
    learningStatus.textContent = 'adaptive field unavailable';
    return;
  }

  if (status.status === 'ready') {
    const lossText = Number.isFinite(status.loss) ? `; loss ${status.loss.toFixed(3)}` : '';
    learningStatus.textContent = `adaptive attack/defense field active${lossText}`;
  } else if (status.status === 'fallback') {
    learningStatus.textContent = `TF.js unavailable: ${status.message}`;
  } else {
    learningStatus.textContent = status.message;
  }
}

function readObservation(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (_) {
    return {};
  }
}

function writeObservation(storageKey, data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function renderWaypointPanel() {
  const container = document.querySelector('.regime-cards');
  if (!container) return;

  container.innerHTML = '';
  for (const wp of getWaypoints(ENGINE_MODE)) {
    const storageKey = `nbiome-observe-${ENGINE_MODE}-${wp.phi}`;
    const saved = readObservation(storageKey);
    const paramsText = `k=${wp.kGate.toFixed(2)} tau=${wp.tau.toFixed(2)} threshold=${wp.threshold.toFixed(2)}`;

    const card = document.createElement('div');
    card.className = 'regime-card';
    card.style.setProperty('--zone-color', wp.color);
    card.innerHTML = `
      <div class="regime-card-top">
        <span class="regime-card-name">${wp.label}</span>
        <span class="regime-card-phi">phi = ${wp.phi.toFixed(2)}</span>
        <button type="button" class="regime-card-jump">jump</button>
      </div>
      <p class="regime-card-params">${paramsText}</p>
      <p class="regime-card-expected">${EXPECTED_BEHAVIOR[wp.label] ?? ''}</p>
      <div class="researcher-tools">
        <textarea class="regime-card-notes" rows="2" placeholder="lab notes...">${saved.notes || ''}</textarea>
      </div>
    `;

    card.querySelector('.regime-card-jump')?.addEventListener('click', () => setPhi(wp.phi, true));
    card.querySelector('.regime-card-notes')?.addEventListener('input', (event) => {
      const nextSaved = readObservation(storageKey);
      nextSaved.notes = event.target.value;
      writeObservation(storageKey, nextSaved);
    });

    container.appendChild(card);
  }
}

function loop() {
  const params = phiToParams(phi, ENGINE_MODE);
  grid.setParams(params.kGate, params.tau, params.threshold);

  for (let i = 0; i < STEPS_PER_FRAME; i++) grid.step();

  renderer.draw(grid);

  if (frame % 2 === 0) {
    chart.push(grid.getPopulations());
    chart.draw();
  }

  if (frame % 20 === 0) updateLearningStatus();

  frame++;
  requestAnimationFrame(loop);
}

renderRegimeLabels();
renderWaypointPanel();
setPhi(DEFAULT_PHI, true);
updateLearningStatus();

slider?.addEventListener('input', (event) => setPhi(event.target.value, false));
resetButton?.addEventListener('click', () => setPhi(phi, true));

researcherToggle?.addEventListener('click', () => {
  const panel = document.querySelector('.regime-panel');
  const isActive = panel?.classList.toggle('is-researcher');
  researcherToggle.textContent = isActive ? 'hide lab notes' : 'show lab notes';
  researcherToggle.classList.toggle('is-active', Boolean(isActive));
});

document.addEventListener('click', (event) => {
  const btn = event.target.closest('.article-jump');
  if (!btn) return;

  const targetPhi = Number(btn.dataset.phi);
  if (!Number.isFinite(targetPhi)) return;

  setPhi(targetPhi, true);
  document.querySelector('.interactive-demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

loop();

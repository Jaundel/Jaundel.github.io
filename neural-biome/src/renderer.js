/**
 * renderer.js
 *
 * Canvas 2D pixel renderer shared by the prototype and adaptive engines.
 */

import { N_SPECIES, SPECIES_COLORS } from './nca.js';

function clampByte(value) {
  return Math.max(0, Math.min(255, value | 0));
}

export class Renderer {
  constructor(canvas, gridW, gridH) {
    this.canvas = canvas;
    this.gridW = gridW;
    this.gridH = gridH;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;

    canvas.width = gridW;
    canvas.height = gridH;
    this.imageData = this.ctx.createImageData(gridW, gridH);
  }

  draw(grid) {
    const pixels = this.imageData.data;
    const alive = grid.alive;

    for (let cell = 0; cell < grid.W * grid.H; cell++) {
      const speciesBase = cell * N_SPECIES;
      const pixelBase = cell * 4;
      let r = 245;
      let g = 245;
      let b = 242;
      let total = 0;
      let mixR = 0;
      let mixG = 0;
      let mixB = 0;

      for (let species = 0; species < N_SPECIES; species++) {
        const amount = alive[speciesBase + species];
        if (amount <= 0.001) continue;

        total += amount;
        mixR += SPECIES_COLORS[species][0] * amount;
        mixG += SPECIES_COLORS[species][1] * amount;
        mixB += SPECIES_COLORS[species][2] * amount;
      }

      if (total > 0.001) {
        const brightness = Math.min(1, total);
        r = (mixR / total) * brightness + 18 * (1 - brightness);
        g = (mixG / total) * brightness + 20 * (1 - brightness);
        b = (mixB / total) * brightness + 24 * (1 - brightness);
      }

      pixels[pixelBase] = clampByte(r);
      pixels[pixelBase + 1] = clampByte(g);
      pixels[pixelBase + 2] = clampByte(b);
      pixels[pixelBase + 3] = 255;
    }

    this.ctx.putImageData(this.imageData, 0, 0);
  }
}

// render.js: Draws the complete multi-panel GTA-style cover art to any canvas

import { getLayoutPanels } from './layout.js';
import { getPhoto } from './photos.js';
import { drawGrade } from './grade.js';
import { drawCaption } from './caption.js';

export function renderCover(canvas, options = {}) {
  const {
    width = canvas.width,
    height = canvas.height,
    layout = 'Vice Grid',
    panels = [],
    caption = {},
    grade = 'Sunset',
    selectedPanel = -1,
    showOutline = false
  } = options;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background base
  ctx.fillStyle = '#0f0c1b';
  ctx.fillRect(0, 0, width, height);

  const panelRects = getLayoutPanels(layout, width, height);

  // Draw panels
  panelRects.forEach((rect, idx) => {
    const pConfig = panels[idx] || { photoId: 'pier', zoom: 1, offsetX: 0, offsetY: 0, fit: 'cover' };
    const photoObj = getPhoto(pConfig.photoId) || getPhoto('pier');

    ctx.save();
    ctx.beginPath();
    // Rounded corners for panels
    const radius = Math.round(width * 0.012);
    if (ctx.roundRect) {
      ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
    } else {
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.clip();

    // Fill background of panel
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

    if (photoObj && photoObj.img && photoObj.img.complete && photoObj.img.naturalWidth > 0) {
      const img = photoObj.img;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      let drawW, drawH, drawX, drawY;
      const panelAspect = rect.w / rect.h;
      const imgAspect = imgW / imgH;

      if (pConfig.fit === 'contain') {
        if (imgAspect > panelAspect) {
          drawW = rect.w;
          drawH = rect.w / imgAspect;
        } else {
          drawH = rect.h;
          drawW = rect.h * imgAspect;
        }
      } else {
        // cover
        if (imgAspect > panelAspect) {
          drawH = rect.h;
          drawW = rect.h * imgAspect;
        } else {
          drawW = rect.w;
          drawH = rect.w / imgAspect;
        }
      }

      // Apply zoom
      drawW *= pConfig.zoom;
      drawH *= pConfig.zoom;

      // Center + offset
      drawX = rect.x + (rect.w - drawW) / 2 + pConfig.offsetX;
      drawY = rect.y + (rect.h - drawH) / 2 + pConfig.offsetY;

      if (drawW >= rect.w) {
        drawX = Math.max(rect.x + rect.w - drawW, Math.min(rect.x, drawX));
      }
      if (drawH >= rect.h) {
        drawY = Math.max(rect.y + rect.h - drawH, Math.min(rect.y, drawY));
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    ctx.restore();

    // Panel border / frame
    ctx.save();
    ctx.lineWidth = Math.max(2, Math.round(width * 0.003));
    if (showOutline && idx === selectedPanel) {
      ctx.strokeStyle = '#ff2e88'; // Bright neon pink selection outline
      ctx.lineWidth = Math.max(4, Math.round(width * 0.006));
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    }
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
      ctx.stroke();
    } else {
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
  });

  // Color Grade overlay
  drawGrade(ctx, width, height, grade);

  // Caption lettering
  drawCaption(ctx, width, height, caption);
}

// main.js: Bootstrap, UI wiring, live preview, drag-to-pan, and export logic

import { initDefaultPhotos, addPhoto, getAllPhotos, loadImage, state as photoState } from './photos.js';
import { renderCover } from './render.js';
import { getLayoutPanels } from './layout.js';
import { handleShotMode } from './shots.js';

const appState = {
  canvasWidth: 1080,
  canvasHeight: 1080,
  layout: 'Vice Grid',
  grade: 'Sunset',
  panels: photoState.panels,
  caption: {
    text: 'SUNSET HEIST',
    subText: 'SUNSET STORIES',
    font: 'Anton',
    size: 72,
    color: '#ffffff',
    outline: true,
    glow: true,
    bottomPos: false
  },
  selectedPhotoId: 'pier'
};

const canvas = document.getElementById('coverCanvas');
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

function redraw() {
  renderCover(canvas, {
    width: appState.canvasWidth,
    height: appState.canvasHeight,
    layout: appState.layout,
    panels: appState.panels,
    caption: appState.caption,
    grade: appState.grade,
    selectedPanel: photoState.selectedPanel,
    showOutline: true
  });
}

function updateTrayUI() {
  const tray = document.getElementById('photoTray');
  tray.innerHTML = '';
  getAllPhotos().forEach(p => {
    const thumb = document.createElement('img');
    thumb.src = p.url;
    if (p.id === appState.selectedPhotoId) thumb.classList.add('selected');
    thumb.onclick = () => {
      appState.selectedPhotoId = p.id;
      updateTrayUI();
    };
    tray.appendChild(thumb);
  });
}

function updateCropUI() {
  const pConfig = appState.panels[photoState.selectedPanel] || appState.panels[0];
  document.getElementById('zoomSlider').value = pConfig.zoom;
  document.getElementById('zoomVal').textContent = pConfig.zoom.toFixed(2);
  document.getElementById('fitBtn').classList.toggle('active', pConfig.fit === 'fit');
  document.getElementById('fillBtn').classList.toggle('active', pConfig.fit === 'cover');
}

function wireControls() {
  // Sample & Upload
  document.getElementById('loadPier').onclick = () => {
    appState.panels[photoState.selectedPanel].photoId = 'pier';
    redraw();
  };
  document.getElementById('loadBoulevard').onclick = () => {
    appState.panels[photoState.selectedPanel].photoId = 'boulevard';
    redraw();
  };

  document.getElementById('photoInput').onchange = (e) => {
    Array.from(e.target.files).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const id = 'upload_' + Date.now() + '_' + idx;
      addPhoto(id, url);
      loadImage(url).then(() => {
        updateTrayUI();
        redraw();
      });
    });
    updateTrayUI();
  };

  document.getElementById('useInSelected').onclick = () => {
    appState.panels[photoState.selectedPanel].photoId = appState.selectedPhotoId;
    redraw();
  };

  document.getElementById('fillAll').onclick = () => {
    appState.panels.forEach(p => { p.photoId = appState.selectedPhotoId; });
    redraw();
  };

  // Layouts
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.layout = btn.dataset.layout;
      redraw();
    };
  });

  // Grades
  document.querySelectorAll('.grade-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.grade = btn.dataset.grade;
      redraw();
    };
  });

  // Crop & Zoom
  const zoomSlider = document.getElementById('zoomSlider');
  zoomSlider.oninput = (e) => {
    const val = parseFloat(e.target.value);
    appState.panels[photoState.selectedPanel].zoom = val;
    document.getElementById('zoomVal').textContent = val.toFixed(2);
    redraw();
  };

  document.getElementById('fitBtn').onclick = () => {
    appState.panels[photoState.selectedPanel].fit = 'contain';
    updateCropUI();
    redraw();
  };
  document.getElementById('fillBtn').onclick = () => {
    appState.panels[photoState.selectedPanel].fit = 'cover';
    updateCropUI();
    redraw();
  };

  // Caption inputs
  const captionText = document.getElementById('captionText');
  captionText.oninput = (e) => {
    appState.caption.text = e.target.value;
    redraw();
  };

  const subCaptionText = document.getElementById('subCaptionText');
  subCaptionText.oninput = (e) => {
    appState.caption.subText = e.target.value;
    redraw();
  };

  document.getElementById('fontSelect').onchange = (e) => {
    appState.caption.font = e.target.value;
    document.fonts.ready.then(redraw);
  };

  document.querySelectorAll('.c-dot').forEach(dot => {
    dot.onclick = () => {
      document.querySelectorAll('.c-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      appState.caption.color = dot.dataset.color;
      redraw();
    };
  });

  const sizeSlider = document.getElementById('sizeSlider');
  sizeSlider.oninput = (e) => {
    const val = parseInt(e.target.value, 10);
    appState.caption.size = val;
    document.getElementById('sizeVal').textContent = val;
    redraw();
  };

  document.getElementById('outlineCheck').onchange = (e) => {
    appState.caption.outline = e.target.checked;
    redraw();
  };
  document.getElementById('glowCheck').onchange = (e) => {
    appState.caption.glow = e.target.checked;
    redraw();
  };
  document.getElementById('posCheck').onchange = (e) => {
    appState.caption.bottomPos = e.target.checked;
    redraw();
  };

  // Export buttons
  const statusMsg = document.getElementById('statusMsg');
  function exportCover(w, h, filename) {
    const offCanvas = document.createElement('canvas');
    renderCover(offCanvas, {
      width: w,
      height: h,
      layout: appState.layout,
      panels: appState.panels,
      caption: appState.caption,
      grade: appState.grade,
      selectedPanel: -1,
      showOutline: false
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = offCanvas.toDataURL('image/png');
    link.click();
    statusMsg.textContent = `Downloaded ${filename} (${w}x${h})`;
  }

  document.getElementById('exp1080').onclick = () => exportCover(1080, 1080, 'vice-cover-1080.png');
  document.getElementById('expTall').onclick = () => exportCover(1080, 1350, 'vice-cover-tall.png');
  document.getElementById('exp1920').onclick = () => exportCover(1920, 1080, 'vice-cover-1920.png');

  // Canvas interaction: click to select panel, drag to pan
  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const panelRects = getLayoutPanels(appState.layout, canvas.width, canvas.height);
    panelRects.forEach((r, idx) => {
      if (clickX >= r.x && clickX <= r.x + r.w && clickY >= r.y && clickY <= r.y + r.h) {
        photoState.selectedPanel = idx;
        appState.selectedPhotoId = appState.panels[idx].photoId;
        updateTrayUI();
        updateCropUI();
        redraw();
      }
    });

    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  };

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const pConfig = appState.panels[photoState.selectedPanel];
    const scale = canvas.width / canvas.getBoundingClientRect().width;
    pConfig.offsetX += dx * scale;
    pConfig.offsetY += dy * scale;
    redraw();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// Initialize
initDefaultPhotos(async () => {
  updateTrayUI();
  updateCropUI();
  await Promise.all([
    loadImage('samples/pier.jpg'),
    loadImage('samples/boulevard.jpg')
  ]);
  document.fonts.ready.then(async () => {
    const handled = await handleShotMode(appState, redraw);
    if (!handled) {
      redraw();
    }
  });
});

wireControls();

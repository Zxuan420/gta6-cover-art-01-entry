// shots.js: Handles automated screenshot modes via URL query parameters

import { getPhoto, loadImage } from './photos.js';

export async function handleShotMode(appState, redrawCallback) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;

  document.body.classList.add('shot-mode');

  const photo = params.get('photo');
  const caption = params.get('caption');

  if (photo) {
    appState.panels[0].photoId = photo;
  }
  if (caption) {
    appState.caption.text = caption;
  }

  if (shot === 'cover') {
    appState.canvasWidth = 1920;
    appState.canvasHeight = 1080;
  } else if (shot === 'cover-square') {
    appState.canvasWidth = 1080;
    appState.canvasHeight = 1080;
  } else if (shot === 'cover-tall') {
    appState.canvasWidth = 1080;
    appState.canvasHeight = 1350;
  } else if (shot === 'editor') {
    appState.canvasWidth = 1080;
    appState.canvasHeight = 1080;
    appState.layout = 'Vice Grid';
    document.body.classList.remove('shot-mode'); // Keep editor chrome visible for editor screenshot
  }

  redrawCallback();

  const photoPromises = appState.panels.map(p => {
    const photoObj = getPhoto(p.photoId);
    if (photoObj && photoObj.url) {
      return loadImage(photoObj.url);
    }
    return Promise.resolve();
  });

  await Promise.all([
    ...photoPromises,
    document.fonts.ready
  ]);

  redrawCallback();

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
  return true;
}

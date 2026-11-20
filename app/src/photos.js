// photos.js: Manages photo store, samples, tray, and per-panel crop states

const photos = new Map(); // id -> { id, url, img }
const imageCache = new Map(); // url -> HTMLImageElement

// Default per-panel crop states (re-verified)
export const state = {
  selectedPanel: 0,
  panels: [
    { photoId: 'pier', zoom: 1.0, offsetX: 0, offsetY: 320, fit: 'cover' },
    { photoId: 'boulevard', zoom: 1.05, offsetX: -40, offsetY: 280, fit: 'cover' },
    { photoId: 'boulevard', zoom: 1.05, offsetX: 40, offsetY: 240, fit: 'cover' }
  ]
};

export function initDefaultPhotos(onReady) {
  addPhoto('pier', 'samples/pier.jpg');
  addPhoto('boulevard', 'samples/boulevard.jpg');
  if (onReady) onReady();
}

export function addPhoto(id, url) {
  if (photos.has(id)) return id;
  const img = new Image();
  img.onerror = () => {
    console.warn(`Failed to load image: ${url}`);
  };
  img.src = url;
  photos.set(id, { id, url, img });
  imageCache.set(url, img);
  return id;
}

export function getPhoto(id) {
  return photos.get(id);
}

export function getAllPhotos() {
  return Array.from(photos.values());
}

export function loadImage(url) {
  if (imageCache.has(url)) {
    const img = imageCache.get(url);
    if (img.complete && img.naturalWidth > 0) {
      return Promise.resolve(img);
    }
    return new Promise((resolve, reject) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve(img);
        return;
      }
      const prevLoad = img.onload;
      const prevError = img.onerror;
      img.onload = (e) => {
        if (prevLoad) prevLoad(e);
        resolve(img);
      };
      img.onerror = (e) => {
        if (prevError) prevError(e);
        reject(e);
      };
      if (typeof img.decode === 'function') {
        img.decode().then(() => resolve(img)).catch(() => {});
      }
    });
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
    imageCache.set(url, img);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    if (url.startsWith('http://') || url.startsWith('https://')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Returns a cropped blob (square for circular display).
 */
export async function getCroppedImageBlob(imageSrc, pixelCrop, mimeOrQuality = 'image/jpeg') {
  let mime = 'image/jpeg';
  let quality = 0.92;
  if (typeof mimeOrQuality === 'number') {
    quality = mimeOrQuality;
  } else if (typeof mimeOrQuality === 'string' && mimeOrQuality.startsWith('image/')) {
    mime = mimeOrQuality;
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = Math.max(1, Math.round(pixelCrop.width));
  const height = Math.max(1, Math.round(pixelCrop.height));
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to crop image'));
      },
      mime,
      quality
    );
  });
}

/** Load image as data URL for the cropper (avoids CORS on canvas). */
export async function imageUrlToDataUrl(url) {
  if (!url) throw new Error('Missing image URL');
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  let fetchUrl = url;
  if (url.startsWith('/')) {
    fetchUrl = `${window.location.origin}${url}`;
  }

  const downloadMatch = url.match(/\/api\/download\?path=([^&]+)/);
  if (downloadMatch) {
    fetchUrl = `${window.location.origin}/api/download?path=${downloadMatch[1]}`;
  } else {
    const b2Match = url.match(/\/file\/[^/]+\/(.+)$/);
    if (b2Match) {
      const path = decodeURIComponent(b2Match[1]);
      fetchUrl = `${window.location.origin}/api/download?path=${encodeURIComponent(path)}`;
    }
  }

  const response = await fetch(fetchUrl);
  if (!response.ok) throw new Error('Could not load image for cropping');
  const blob = await response.blob();
  return fileToDataUrl(blob);
}

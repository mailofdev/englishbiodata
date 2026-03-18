// imageUtils.js
export const resizeImageTo500KB = (base64Str) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const MAX_SIZE = 500 * 1024;  // 500KB limit
      let quality = 1.0;

      const resize = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataURLToBlob(dataUrl).size > MAX_SIZE && quality > 0.1) {
          quality -= 0.1;
          requestAnimationFrame(resize);
        } else {
          resolve(dataUrl);
        }
      };

      resize();
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};

// Helper function to convert base64 data URL to Blob
const dataURLToBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

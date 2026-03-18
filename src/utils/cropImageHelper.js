export const getCroppedImg = (imageSrc, crop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const { width, height, x, y } = crop;

      canvas.width = width;
      canvas.height = height;

      // Draw the image onto the canvas using crop coordinates
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

      // Convert canvas to Data URL
      const dataUrl = canvas.toDataURL('image/jpeg');

      // Convert Data URL to Blob
      const blob = dataURLToBlob(dataUrl);
      
      if (blob) {
        resolve(blob);  // Resolve with Blob
      } else {
        reject(new Error('Could not create Blob from cropped image'));
      }
    };

    image.onerror = (error) => reject(error);
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

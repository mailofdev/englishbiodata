import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageUploadWithCrop = ({ onChange }) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: "px", width: 200, aspect: 1 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [fileSizeError, setFileSizeError] = useState("");
  const imageRef = useRef(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSrc(reader.result);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    if (onChange) onChange(event);
  };

  const onImageLoaded = (image) => { imageRef.current = image; };
  const handleCropComplete = (crop) => { setCompletedCrop(crop); };
  const handleCropChange = (newCrop) => { setCrop(newCrop); };

  const getCroppedImage = async (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) { reject(new Error("Canvas is empty")); return; }
        const file = new File([blob], "croppedImage.jpeg", { type: "image/jpeg" });
        if (blob.size > 500 * 1024) {
          setFileSizeError("The file is larger than 500KB. Resizing...");
          const newBlob = await resizeImage(blob, 500);
          resolve(URL.createObjectURL(newBlob));
        } else {
          resolve(URL.createObjectURL(file));
        }
      }, "image/jpeg", 1);
    });
  };

  const resizeImage = (blob, maxSizeKB) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      img.onload = () => {
        const scaleFactor = Math.sqrt(maxSizeKB * 1024 / blob.size);
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((resizedBlob) => resolve(resizedBlob), "image/jpeg");
      };
    });
  };

  const handleCropAndResize = async () => {
    if (completedCrop && imageRef.current) {
      const url = await getCroppedImage(imageRef.current, completedCrop);
      setCroppedImageUrl(url);
      setFileSizeError("");
      setIsModalOpen(false);
    }
  };

  const closeModal = () => { setIsModalOpen(false); setSrc(null); };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {isModalOpen && (
        <div>
          <div>
            <h3>Crop Image</h3>
            {src && (
              <ReactCrop src={src} crop={crop} onImageLoaded={onImageLoaded} onComplete={handleCropComplete} onChange={handleCropChange} locked={false} aspect={1} />
            )}
            <button onClick={handleCropAndResize}>Crop & Resize</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
      {croppedImageUrl && (
        <div>
          <h3>Cropped Image:</h3>
          <img alt="Cropped" src={croppedImageUrl} />
        </div>
      )}
      {fileSizeError && <p>{fileSizeError}</p>}
    </div>
  );
};

export default ImageUploadWithCrop;

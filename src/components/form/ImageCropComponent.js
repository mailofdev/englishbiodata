import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImageHelper';
import { resizeImageTo500KB } from '../../utils/imageUtils';
import { readFileAsDataURL } from '../../utils/readFileAsDataURL';

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.1;

const ImageCropComponent = ({ handleCroppedImageChange }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(() => {
    const savedImage = localStorage.getItem('croppedImage');
    return savedImage || null;
  });
  const [isCropped, setIsCropped] = useState(!!croppedImage);
  const cropAreaRef = useRef(null);
  const [cropAreaHeight, setCropAreaHeight] = useState(280);

  const measureCropArea = useCallback(() => {
    if (cropAreaRef.current) {
      const width = cropAreaRef.current.offsetWidth;
      if (width < 400) setCropAreaHeight(260);
      else if (width < 576) setCropAreaHeight(300);
      else if (width < 768) setCropAreaHeight(360);
      else setCropAreaHeight(400);
    }
  }, []);

  useEffect(() => {
    measureCropArea();
    const el = cropAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureCropArea);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureCropArea, imageSrc]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageDataUrl = await readFileAsDataURL(file);
      setImageSrc(imageDataUrl);
      setIsCropped(false);
      setCroppedAreaPixels(null);
    }
  };

  const handleCropAndShowImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!(croppedBlob instanceof Blob)) {
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(croppedBlob);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const resizedImage = await resizeImageTo500KB(base64Image);
        setCroppedImage(resizedImage);
        setIsCropped(true);
        handleCroppedImageChange(resizedImage);
        localStorage.setItem('croppedImage', resizedImage);
      };
    } catch (error) {
      // Cropping/resizing failed
    }
  };

  const removeCroppedImage = () => {
    localStorage.removeItem('croppedImage');
    setCroppedImage(null);
    setIsCropped(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
    handleCroppedImageChange(null);
  };

  return (
    <div className="photo-upload-flow">
      {/* Upload trigger */}
      <div className="mb-4">
        <label htmlFor="photoFileInput" className="btn btn-primary btn-lg px-4 py-3 w-100 w-md-auto">
          <span className="d-inline-block me-2" aria-hidden>📷</span>
          Choose photo
        </label>
        <input
          id="photoFileInput"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="d-none"
          aria-label="Choose photo"
        />
      </div>

      {/* Crop area – shown when image selected and not yet cropped */}
      {imageSrc && !isCropped && (
        <div className="photo-crop-section mb-4">
          <div
            ref={cropAreaRef}
            className="photo-crop-area rounded-3 overflow-hidden bg-dark"
            style={{ height: cropAreaHeight }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
            />
          </div>
          <div className="mt-3">
            <label className="form-label small text-muted mb-1 d-block">Zoom</label>
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="form-range"
            />
          </div>
          <div className="mt-3 d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleCropAndShowImage}
              disabled={!croppedAreaPixels}
            >
              Crop & add
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => { setImageSrc(null); setCroppedAreaPixels(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cropped preview – shown after crop */}
      {croppedImage && (
        <div className="photo-preview-section">
          <p className="small fw-medium text-muted mb-2">Your added photo</p>
          <div className="photo-preview-frame rounded-3 overflow-hidden shadow-sm bg-light d-inline-block">
            <img
              src={croppedImage}
              alt="Cropped preview"
              className="photo-preview-img"
            />
          </div>
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={removeCroppedImage}
            >
              Remove photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropComponent;

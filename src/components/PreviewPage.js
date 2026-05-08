import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import PDFDocument from "./pdf/PDFDocument";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import jsPDF from "jspdf";
import axios from "axios";
import { useToast } from "./ui/ToastContext";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  // CRA / Vite: must be defined at build time. On Vercel set REACT_APP_API_BASE_URL (no trailing slash).
  const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "").trim().replace(/\/$/, "");

  const PHONEPE_CONTEXT_KEY = "pendingPhonePeContext";
  const PHONEPE_ORDER_KEY = "pendingPhonePeOrderId";
  const hasVerifiedPaymentRef = useRef(false);

  const restorePhonePeContext = () => {
    try {
      const raw = localStorage.getItem(PHONEPE_CONTEXT_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  };

  const restoredContext = restorePhonePeContext();
  const currentState = location.state || {};

  const formData = currentState.formData || restoredContext.formData;
  const initialTemplateId = currentState.templateId ?? restoredContext.templateId;
  const imagePreview = currentState.imagePreview || restoredContext.imagePreview;
  const centerText = currentState.centerText || restoredContext.centerText;
  const [additionalImage] = useState(() => {
    const storedImage = localStorage.getItem("croppedImage");
    return storedImage || null;
  });

  // Normalize to number 1-12 so template selection and PDFDocument stay in sync
  const [templateId, setTemplateId] = useState(() => {
    const t = Number(initialTemplateId);
    return t >= 1 && t <= 12 ? t : 1;
  });
  const [loading, setLoading] = useState(false);
  const [pdfImage, setPdfImage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isPhonePeProcessing, setIsPhonePeProcessing] = useState(false);

  const templates = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate PDF preview with watermark
  useEffect(() => {
    if (!formData) return;
    const generatePdfPreview = async () => {
      setLoading(true);
      setPdfImage(null); // clear old preview so we don't show wrong template
      try {
        const pdfBlob = await pdf(
          <PDFDocument
            formData={formData}
            templateId={templateId}
            {...(additionalImage && { additionalImage })}
            imagePreview={imagePreview}
            centerText={centerText}
          />
        ).toBlob();

        const pdfArrayBuffer = await pdfBlob.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
        const pdfDocument = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;

        const page = await pdfDocument.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        // Watermark at 5 different places: draw each at a corner with translate + rotate so all 5 are visible
        const w = canvas.width;
        const h = canvas.height;
        const text = "mazabiodata.com";
        const margin = 180;
        const positions = [
          [margin, margin],
          [w - margin, margin],
          [w / 2, h / 2],
          [margin, h - margin],
          [w - margin, h - margin],
        ];
        context.font = "bold 56px Arial";
        context.fillStyle = "rgba(90, 90, 90, 0.32)";
        context.textAlign = "center";
        context.textBaseline = "middle";
        positions.forEach(([x, y]) => {
          context.save();
          context.translate(x, y);
          context.rotate((-45 * Math.PI) / 180);
          context.fillText(text, 0, 0);
          context.restore();
        });

        const imageUrl = canvas.toDataURL("image/png");
        setPdfImage(imageUrl);
      } catch (error) {
        // PDF preview failed
      } finally {
        setLoading(false);
      }
    };

    generatePdfPreview();
  }, [formData, templateId, additionalImage, imagePreview, centerText]);

  // Download PDF without watermark (clean version)
  const downloadPDF = useCallback(async () => {
    if (!formData || typeof formData !== "object") {
      showToast("Unable to download PDF: biodata details are missing.", "error");
      return;
    }

    setShowLoader(true);
    try {
      const pdfBlob = await pdf(
        <PDFDocument
          formData={formData}
          templateId={templateId}
          additionalImage={additionalImage}
          imagePreview={imagePreview}
          centerText={centerText}
        />
      ).toBlob();

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      const userName = formData.name?.value || "download";
      link.href = url;
      link.download = `${userName}_biodata.pdf`;
      link.click();
    } catch (error) {
      // Download failed
    } finally {
      setShowLoader(false);
    }
  }, [formData, templateId, additionalImage, imagePreview, centerText, showToast]);

  // Download PDF with watermark (unchanged)
  const downloadPDFWithWatermark = async () => {
    if (!pdfImage) {
      showToast("Preview image not available.", "warning");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [600, 800],
      });

      doc.addImage(pdfImage, "PNG", 0, 0, 600, 800);
      const userName = formData.name?.value || "download";
      doc.save(`${userName}_biodata_with_watermark.pdf`);
    } catch (error) {
      // Watermark PDF failed
    }
  };

  const getApiErrorMessage = useCallback((error, fallbackMessage) => {
    if (error?.code === "ECONNABORTED") {
      return "Request timed out. Please check your internet connection and try again.";
    }
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.status) {
      return `${fallbackMessage} (HTTP ${error.response.status})`;
    }
    if (error?.request) {
      return "No response from server. Please ensure API server is running.";
    }
    return fallbackMessage;
  }, []);

  const handleEditClick = () => {
    navigate("/input-form/1", {
      state: {
        initialFormData: formData,
        imagePreview,
        centerText,
        additionalImage,
        templateId,
      },
    });
  };

  useEffect(() => {
    if (location.state?.formData) {
      localStorage.setItem(
        PHONEPE_CONTEXT_KEY,
        JSON.stringify({
          formData: location.state.formData,
          templateId,
          imagePreview,
          centerText,
          additionalImage,
        })
      );
    }
  }, [location.state, templateId, imagePreview, centerText, additionalImage]);

  useEffect(() => {
    const verifyPayment = async () => {
      if (hasVerifiedPaymentRef.current) return;

      const params = new URLSearchParams(window.location.search);
      const orderId =
        params.get("merchantOrderId") ||
        params.get("orderId") ||
        localStorage.getItem(PHONEPE_ORDER_KEY);
  
      if (!orderId) return;

      if (!apiBaseUrl) {
        showToast(
          "Payment API is not configured. Add REACT_APP_API_BASE_URL in Vercel and redeploy.",
          "error"
        );
        return;
      }

      hasVerifiedPaymentRef.current = true;

      try {
        setShowLoader(true);
        let res;
        let lastError;

        for (let attempt = 1; attempt <= 3; attempt += 1) {
          try {
            res = await axios.get(`${apiBaseUrl}/api/phonepe/status/${orderId}`);
            break;
          } catch (err) {
            lastError = err;
            const isRateLimited = err?.response?.status === 429;
            if (!isRateLimited || attempt === 3) {
              throw err;
            }
            // Backoff for transient PhonePe throttle
            await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
          }
        }

        if (!res && lastError) throw lastError;
  
        const status = res.data?.state || res.data?.data?.state;
  
        if (status === "COMPLETED") {
          await downloadPDF();
          showToast("Payment successful! Your download has started.", "success");
        } else {
          showToast(`Payment status: ${status || "UNKNOWN"}.`, "warning");
        }
      } catch (err) {
        showToast(getApiErrorMessage(err, "Payment verification failed."), "error");
      } finally {
        localStorage.removeItem(PHONEPE_ORDER_KEY);
        localStorage.removeItem(PHONEPE_CONTEXT_KEY);
        // Remove order query params after verification to avoid repeated checks
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, "", cleanUrl);
        setShowLoader(false);
      }
    };
  
    verifyPayment();
  }, [apiBaseUrl, downloadPDF, getApiErrorMessage, showToast]);

  const handlePhonePePayment = async () => {
    if (!apiBaseUrl) {
      showToast(
        "Payment API is not configured. Add REACT_APP_API_BASE_URL in Vercel (your backend URL) and redeploy.",
        "error"
      );
      return;
    }

    try {
      setIsPhonePeProcessing(true);
      setShowLoader(true);
  
      const res = await axios.post(`${apiBaseUrl}/api/phonepe/create-payment`, {
        amount: 49, // ₹49
      });
  
      const redirectUrl = res.data?.redirectUrl || res.data?.data?.redirectUrl;
      const createdOrderId = res.data?.orderId || res.data?.data?.orderId;

      if (createdOrderId) {
        localStorage.setItem(PHONEPE_ORDER_KEY, createdOrderId);
      }
      localStorage.setItem(
        PHONEPE_CONTEXT_KEY,
        JSON.stringify({
          formData,
          templateId,
          imagePreview,
          centerText,
          additionalImage,
        })
      );
  
      if (!redirectUrl) {
        throw new Error("No redirect URL received");
      }
  
      // Redirect to PhonePe payment page
      window.location.href = redirectUrl;
  
    } catch (error) {
      showToast(getApiErrorMessage(error, "Payment initiation failed."), "error");
    } finally {
      setIsPhonePeProcessing(false);
      setShowLoader(false);
    }
  };

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="h2 fw-bold text-center app-body-text mb-2">Preview - Template {templateId}</h1>
      <p className="text-muted text-center app-body-text mb-4">
        Your biodata is ready. Use the options below.
      </p>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5 text-center">
              {loading ? (
                <div className="py-5">
                  <div className="spinner-border text-primary" role="status" aria-label="Loading">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 small text-muted">Loading...</p>
                </div>
              ) : pdfImage ? (
                <div className="pdf-preview-wrapper w-100">
                  <img
                    src={pdfImage}
                    alt="Biodata preview"
                    className="img-fluid rounded-3 shadow-sm pdf-preview-img"
                  />
                </div>
              ) : (
                <p className="text-muted mb-0">No preview available.</p>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5">
              <h2 className="h5 fw-bold text-primary mb-4 pb-2 border-bottom border-2 border-warning">
                Download or Edit
              </h2>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button type="button" className="btn btn-outline-primary" onClick={downloadPDFWithWatermark}>
                  Download with watermark
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePhonePePayment}
                  disabled={isPhonePeProcessing}
                >
                  {isPhonePeProcessing ? "Starting PhonePe..." : "Pay & Download"}
                </button>
                <button type="button" className="btn btn-outline-info" onClick={handleEditClick}>
                  Edit details
                </button>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5">
              <p className="small fw-bold mb-3 app-body-text">Change template:</p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {templates.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn p-0 border rounded overflow-hidden ${
                      templateId === id ? "border-primary border-3" : "border-secondary"
                    }`}
                    style={{ width: 56, height: 72 }}
                    onClick={() => setTemplateId(id)}
                    aria-pressed={templateId === id}
                    aria-label={`Template ${id}`}
                  >
                    <img
                      src={`${process.env.PUBLIC_URL || ""}/Marriage Biodata Templatep-${
                        id < 10 ? `0${id}` : id
                      }.png`}
                      alt={`Template ${id}`}
                      className="w-100 h-100 rounded"
                      style={{ objectFit: "cover", display: "block" }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLoader && (
        <div className="position-fixed top-50 start-50 translate-middle bg-white rounded shadow-lg p-4 text-center border z-3">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 small mb-0">Loading, please wait...</p>
        </div>
      )}
    </div>
  );
};

export default PreviewPage;


import React, { useEffect, useState } from "react";
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
  const { formData, templateId: initialTemplateId, imagePreview, centerText } = location.state || {};
  const [additionalImage] = useState(() => {
    const storedImage = localStorage.getItem("croppedImage");
    return storedImage || null;
  });

  // Normalize to number 1-12 so template selection and PDFDocument stay in sync
  const [templateId, setTemplateId] = useState(() => {
    const t = Number(initialTemplateId);
    return (t >= 1 && t <= 12) ? t : 1;
  });
  const [loading, setLoading] = useState(false);
  const [pdfImage, setPdfImage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

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
          [margin, margin],           // top-left
          [w - margin, margin],        // top-right
          [w/2, h/2],                   // center
          [margin, h - margin],        // bottom-left
          [w - margin, h - margin],    // bottom-right
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
  const downloadPDF = async () => {
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
      const userName = formData["नाव"]?.value || "download";
      link.href = url;
      link.download = `${userName}_बायोडाटा.pdf`;
      link.click();
    } catch (error) {
      // Download failed
    } finally {
      setShowLoader(false);
    }
  };

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
      const userName = formData["नाव"]?.value || "download";
      doc.save(`${userName}_बायोडाटा_with_watermark.pdf`);
    } catch (error) {
      // Watermark PDF failed
    }
  };

  // Handle payment and download via PHP backend
  const handlePaymentAndDownload = async () => {
  if (!window.Razorpay) {
    showToast("Razorpay SDK failed to load. Are you online?", "error");
    return;
  }

  const options = {
    key: "rzp_live_SKnSlI6Vodp57D",
    amount: 2900,
    currency: "INR",
    name: "MazaBiodata",
    description: "Download PDF without watermark",
    handler: async function (response) {
      setShowLoader(true);
      try {
        const verificationRes = await axios.post(
          "https://algoloomtech.solutions/mazabiodata/capture-payment.php",
          {
            payment_id: response.razorpay_payment_id,
            amount: 2900,
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 10000, // 10 second timeout
          }
        );

        if (verificationRes.data.success) {
          await downloadPDF();
          showToast("Payment successful! Your download has started.", "success");
        } else {
          showToast(
            "Payment verification failed: " +
              (verificationRes.data.message || "Unknown error"),
            "error"
          );
        }
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          showToast("Request timeout. Please check your internet and try again.", "error");
        } else if (error.response) {
          const data = error.response.data;
          let message = `Server error: ${error.response.status}`;
          if (data && data.message) message += ` - ${data.message}`;
          if (data && data.details) {
            message += `\nExpected: ${data.details.expected_amount} paise, Received: ${data.details.received_amount} paise, Status: ${data.details.status}`;
          }
          showToast(message, "error");
        } else if (error.request) {
          // The request was made but no response received
          showToast("No response from server. Please check if your backend is reachable.", "error");
        } else {
          showToast("Something went wrong. Please try again or contact support.", "error");
        }
      } finally {
        setShowLoader(false);
      }
    },
    prefill: {
      name: "Mazabiodata",
      email: "mazabiodata@gmail.com",
      contact: "917776914543",
    },
    theme: {
      color: "#5C2D6E",
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};



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

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="h2 fw-bold text-center marathi-text mb-2">
        Preview — Template {templateId}
      </h1>
      <p className="text-muted text-center marathi-text mb-4">
        आपला बायोडाटा तयार आहे. खालील पर्याय वापरा.
      </p>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5 text-center">
              {loading ? (
                <div className="py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                    aria-label="Loading"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 small text-muted">Loading...</p>
                </div>
              ) : pdfImage ? (
                <div className="pdf-preview-wrapper w-100">
                  <img
                    src={pdfImage}
                    alt="बायोडाटा पूर्वावलोकन"
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
                डाउनलोड किंवा संपादन
              </h2>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={downloadPDFWithWatermark}
                >
                  वॉटरमार्कसह डाउनलोड
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePaymentAndDownload}
                >
                  पेमेंट आणि डाउनलोड
                </button>
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={handleEditClick}
                >
                  माहिती दुरुस्त करा
                </button>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5">
              <p className="small fw-bold mb-3 marathi-text">
                टेम्प्लेट बदला (Select template):
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {templates.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn p-0 border rounded overflow-hidden ${
                      templateId === id
                        ? "border-primary border-3"
                        : "border-secondary"
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
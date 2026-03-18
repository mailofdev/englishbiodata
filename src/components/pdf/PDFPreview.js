import React, { useEffect, useRef } from "react";
import { getDocument } from "pdfjs-dist";

const PDFPreview = ({ pdfUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadPDF = async () => {
      const pdf = await getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 1 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    };
    loadPDF();
  }, [pdfUrl]);

  return <canvas ref={canvasRef} />;
};

export default PDFPreview;

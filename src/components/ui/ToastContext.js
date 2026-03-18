import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

const variantConfig = {
  success: {
    icon: "fa-circle-check",
    title: "Success",
    bg: "bg-success bg-opacity-10 border-success",
    iconColor: "text-success",
    titleColor: "text-success",
  },
  error: {
    icon: "fa-circle-xmark",
    title: "Error",
    bg: "bg-danger bg-opacity-10 border-danger",
    iconColor: "text-danger",
    titleColor: "text-danger",
  },
  warning: {
    icon: "fa-triangle-exclamation",
    title: "Warning",
    bg: "bg-warning bg-opacity-10 border-warning",
    iconColor: "text-warning",
    titleColor: "text-dark",
  },
  info: {
    icon: "fa-circle-info",
    title: "Info",
    bg: "bg-info bg-opacity-10 border-info",
    iconColor: "text-info",
    titleColor: "text-info",
  },
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = "info") => {
    const id = Date.now();
    setToast({ id, message, variant });
    const duration = variant === "success" ? 5000 : 7000;
    const t = setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, duration);
    return () => clearTimeout(t);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <ToastItem
          message={toast.message}
          variant={toast.variant}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ message, variant, onClose }) {
  const config = variantConfig[variant] || variantConfig.info;
  return (
    <div
      className={`position-fixed top-0 end-0 p-3 m-3 border border-2 rounded-3 shadow-lg ${config.bg}`}
      style={{ zIndex: 9999, maxWidth: "min(400px, calc(100vw - 24px))" }}
      role="alert"
      aria-live="polite"
    >
      <div className="d-flex align-items-start gap-3">
        <span className={`fa-solid ${config.icon} ${config.iconColor}`} style={{ fontSize: "1.5rem", marginTop: "2px" }} aria-hidden />
        <div className="flex-grow-1 min-w-0">
          <div className={`fw-bold small ${config.titleColor}`}>{config.title}</div>
          <div className="small text-dark mt-1" style={{ whiteSpace: "pre-line" }}>
            {message}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-link btn-sm text-dark text-decoration-none p-0 opacity-75"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

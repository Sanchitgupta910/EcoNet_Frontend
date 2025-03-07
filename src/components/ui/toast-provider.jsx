"use client";

import { createContext, useContext, useState, useCallback } from "react";
import ToastNotification from "./toast-notifications";

// Create context
const ToastContext = createContext(null);

/**
 * Toast Provider Component
 * Wrap your application with this provider to use the toast functionality
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const showToast = useCallback(
    ({
      message,
      type = "success",
      duration = 5000,
      title,
      position = "bottom-right",
    }) => {
      const id = Date.now().toString();

      setToasts((prevToasts) => [
        ...prevToasts,
        { id, message, type, duration, title, position },
      ]);

      return id;
    },
    []
  );

  // Remove a toast by id
  const hideToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Convenience methods for different toast types
  const success = useCallback(
    (message, options = {}) =>
      showToast({ message, type: "success", ...options }),
    [showToast]
  );

  const error = useCallback(
    (message, options = {}) =>
      showToast({ message, type: "error", ...options }),
    [showToast]
  );

  const warning = useCallback(
    (message, options = {}) =>
      showToast({ message, type: "warning", ...options }),
    [showToast]
  );

  const info = useCallback(
    (message, options = {}) => showToast({ message, type: "info", ...options }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, hideToast, success, error, warning, info }}
    >
      {children}

      {/* Render all active toasts */}
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          visible={true}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          title={toast.title}
          position={toast.position}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

/**
 * Hook to use the toast functionality
 * @returns {Object} Toast methods: showToast, hideToast, success, error, warning, info
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

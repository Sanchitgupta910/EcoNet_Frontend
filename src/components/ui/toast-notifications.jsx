"use client";

import { useState, useEffect } from "react";
import { CheckCircle, X, AlertCircle, Info } from "lucide-react";
import { clname } from "@/lib/utils";

/**
 * Toast Notification Component
 *
 * @param {Object} props
 * @param {string} props.message - The message to display in the toast
 * @param {string} props.type - The type of toast: 'success', 'error', 'info', 'warning'
 * @param {number} props.duration - Duration in ms before auto-dismiss (default: 5000, set to 0 to disable)
 * @param {boolean} props.visible - Whether the toast is visible
 * @param {Function} props.onClose - Function to call when toast is closed
 * @param {string} props.position - Position of the toast: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
 * @param {string} props.title - Optional title for the toast
 */
const ToastNotification = ({
  message,
  type = "success",
  duration = 5000,
  visible = true,
  onClose,
  position = "bottom-right",
  title,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  // Handle auto-dismiss
  useEffect(() => {
    setIsVisible(visible);

    let timer;
    if (visible && duration > 0) {
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, duration, onClose]);

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // If not visible, don't render
  if (!isVisible) return null;

  // Determine icon and colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          borderColor: "border-emerald-500",
          progressColor: "bg-emerald-500",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-500",
          progressColor: "bg-red-500",
        };
      case "warning":
        return {
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-500",
          progressColor: "bg-amber-500",
        };
      case "info":
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-500" />,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-500",
          progressColor: "bg-blue-500",
        };
    }
  };

  const { icon, bgColor, borderColor, progressColor } = getTypeStyles();

  // Determine position classes
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
      default:
        return "bottom-4 right-4";
    }
  };

  return (
    <div
      className={clname(
        "fixed z-50 max-w-md w-full transform transition-all duration-500 ease-in-out",
        getPositionClasses(),
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
    >
      <div
        className={clname(
          "flex items-start overflow-hidden rounded-lg shadow-lg border-l-4",
          bgColor,
          borderColor
        )}
      >
        <div className="flex-1 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{icon}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              {title && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {title}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-md"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar for auto-dismiss */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <div
              className={clname("h-full", progressColor)}
              style={{
                animation: `shrink ${duration / 1000}s linear forwards`,
                transformOrigin: "left",
              }}
            />
          </div>
        )}
      </div>

      {/* CSS for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;

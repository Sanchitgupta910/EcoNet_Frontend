'use client';

import { useState } from 'react';
import { Camera, Info, Plus, ArrowRight, CheckCircle, X } from 'lucide-react';

// Sample data - in a real app, this would come from an API
const sampleOffice = {
  companyName: 'EcoWaste Solutions',
  address: '123 Green Street, Eco City, EC 12345',
  logo: '/placeholder.svg?height=40&width=40',
  bins: [
    { id: 1, type: 'General Waste', color: '#ef4444', lightColor: '#fee2e2' },
    { id: 2, type: 'Paper & Cardboard', color: '#3b82f6', lightColor: '#dbeafe' },
    { id: 3, type: 'Commingled', color: '#22c55e', lightColor: '#dcfce7' },
    { id: 4, type: 'Organic', color: '#f59e0b', lightColor: '#fef3c7' },
    { id: 5, type: 'Glass', color: '#8b5cf6', lightColor: '#ede9fe' },
  ],
};

export default function WasteLoggingScreen() {
  const [recentLogs, setRecentLogs] = useState([]);
  const [showAddToHomeScreen, setShowAddToHomeScreen] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast functionality integrated directly into the component
  const addToast = (title, message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, title, message, type }]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const handleCameraClick = () => {
    addToast(
      'Coming Soon!',
      'AI-powered waste recognition camera will be available in the next update.',
      'info',
    );
  };

  const handleWasteDisposal = (bin) => {
    // Add to recent logs with timestamp
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog = {
      id: Date.now(),
      binType: bin.type,
      color: bin.color,
      time: formattedTime,
    };

    setRecentLogs((prev) => [newLog, ...prev].slice(0, 3)); // Keep only the 3 most recent logs

    addToast(
      'Waste Logged Successfully!',
      `Your ${bin.type} waste has been logged. Check the dashboard for updates.`,
      'success',
    );
  };

  const dismissHomeScreenPrompt = () => {
    setShowAddToHomeScreen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Minimal Header */}
      <header className="sticky top-0 z-10 bg-white backdrop-blur-md bg-opacity-90 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={sampleOffice.logo || '/placeholder.svg'}
              alt="Logo"
              className="h-9 w-9 rounded-md object-cover mr-3 shadow-sm"
            />
            <div>
              <h1 className="text-base font-semibold text-slate-800">{sampleOffice.companyName}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{sampleOffice.address}</p>
            </div>
          </div>
          <button
            onClick={handleCameraClick}
            className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Camera"
          >
            <Camera size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Waste Disposal</h2>
          <p className="text-sm text-slate-500 mt-1">
            Select the type of waste you're disposing to log it in the system.
          </p>
        </div>

        {/* Waste Bin Buttons - Modern, Minimal Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {sampleOffice.bins.map((bin) => (
            <button
              key={bin.id}
              onClick={() => handleWasteDisposal(bin)}
              className="group relative overflow-hidden rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              style={{
                backgroundColor: bin.lightColor,
                borderLeft: `4px solid ${bin.color}`,
              }}
            >
              <div className="flex items-center p-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors duration-300"
                  style={{ backgroundColor: bin.color }}
                >
                  <span className="text-white text-xs font-medium">
                    {bin.type.split(' ')[0].charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-800">{bin.type}</span>
                  <p className="text-xs text-slate-500 mt-0.5">Tap to log disposal</p>
                </div>
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight size={16} className="text-slate-500" />
                </div>
              </div>

              {/* Animated hover effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ backgroundColor: bin.color }}
              ></div>
            </button>
          ))}
        </div>

        {/* Recent Activity Section */}
        {recentLogs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: log.color }}
                  >
                    <CheckCircle size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{log.binType} logged</p>
                  </div>
                  <span className="text-xs text-slate-500">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Message - Minimal Design */}
        <div className="flex items-start p-4 rounded-lg bg-indigo-50 border border-indigo-100 mb-8">
          <Info className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className="ml-3 text-xs text-indigo-700">
            For lightweight waste (like paper), data updates may be delayed due to minimal weight
            changes. Check the dashboard for the most accurate waste statistics.
          </p>
        </div>
      </main>

      {/* Add to Home Screen - Minimal Design */}
      {showAddToHomeScreen && (
        <div className="fixed bottom-4 inset-x-4 sm:max-w-sm sm:mx-auto bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-20">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-800">Add to Home Screen</h3>
                <p className="text-xs text-slate-500 mt-1">
                  For quicker access, add this app to your home screen.
                </p>
              </div>
              <button
                onClick={dismissHomeScreenPrompt}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <span className="sr-only">Dismiss</span>
                <X size={16} />
              </button>
            </div>
            <button
              className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300"
              onClick={dismissHomeScreenPrompt}
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add to Home Screen
            </button>
          </div>
          <div className="h-1 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
        </div>
      )}

      {/* Toast Container - Integrated directly into the component */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg max-w-xs animate-slide-up ${
              toast.type === 'success'
                ? 'bg-green-100 border-l-4 border-green-500'
                : toast.type === 'error'
                ? 'bg-red-100 border-l-4 border-red-500'
                : toast.type === 'warning'
                ? 'bg-amber-100 border-l-4 border-amber-500'
                : 'bg-indigo-100 border-l-4 border-indigo-500'
            }`}
            style={{ animation: 'slide-up 0.3s ease-out forwards' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4
                  className={`font-medium text-sm ${
                    toast.type === 'success'
                      ? 'text-green-800'
                      : toast.type === 'error'
                      ? 'text-red-800'
                      : toast.type === 'warning'
                      ? 'text-amber-800'
                      : 'text-indigo-800'
                  }`}
                >
                  {toast.title}
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    toast.type === 'success'
                      ? 'text-green-600'
                      : toast.type === 'error'
                      ? 'text-red-600'
                      : toast.type === 'warning'
                      ? 'text-amber-600'
                      : 'text-indigo-600'
                  }`}
                >
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Minimal Footer */}
      <footer className="py-4 px-4 text-center text-xs text-slate-400 border-t border-slate-200">
        <p>© 2023 EcoWaste Solutions</p>
      </footer>

      {/* Inline CSS for animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Info, CheckCircle, Loader2, AlertCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';

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

export default function CleanerScreen() {
  const [cleanerId, setCleanerId] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState([]);
  const timerRef = useRef(null);

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

  const handleCleanerIdChange = (e) => {
    setCleanerId(e.target.value);
  };

  const startCleaningProcess = () => {
    if (!cleanerId.trim()) {
      addToast('Cleaner ID Required', 'Please enter your cleaner ID or name to continue.', 'error');
      return;
    }

    setCurrentStep(1);
    setIsProcessing(true);

    addToast(
      'Verification Started',
      'Please wait while we verify the cleaning status of all bins.',
      'info',
    );

    // Simulate API call for bin verification
    timerRef.current = setTimeout(() => {
      setCurrentStep(2);
      setIsProcessing(false);

      addToast('Bins Cleaned Successfully!', 'All bins have been marked as cleaned.', 'success');
    }, 3000);
  };

  const resetProcess = () => {
    setCurrentStep(0);
    setIsProcessing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Minimal Header */}
      <header className="sticky top-0 z-10 bg-white backdrop-blur-md bg-opacity-90 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
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
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Bin Cleaning Verification</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your ID and mark bins as cleaned after servicing.
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium text-slate-600">Verification</span>
              <span className="text-xs font-medium text-slate-600">Completion</span>
            </div>
          </div>
        )}

        {/* Step 1: Initial Form */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-800">Cleaner Verification</h3>
                  <p className="text-sm text-slate-500">Enter your details to start the process</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="cleanerId" className="text-sm font-medium text-slate-700 block">
                    Cleaner ID / Name
                  </label>
                  <input
                    id="cleanerId"
                    type="text"
                    placeholder="Enter your ID or name"
                    value={cleanerId}
                    onChange={handleCleanerIdChange}
                    className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex items-start p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="ml-3 text-xs text-amber-700">
                    Make sure all bins are properly placed on the platform for accurate
                    verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={startCleaningProcess}
                className="w-full h-11 text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                Mark All Bins as Cleaned
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verification Process */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Verifying Cleaning Status
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-md">
                  Please wait while we verify the cleaning status of all bins...
                </p>

                <div className="w-full max-w-md mt-8">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full animate-progress"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start p-4 rounded-lg bg-indigo-50 border border-indigo-100 mt-4">
                <AlertCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-xs text-indigo-700">
                  Ensure all bins remain on the platform during verification. Do not move or remove
                  any bins.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={resetProcess}
                className="w-full h-11 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-6 mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">All Bins Cleaned!</h3>
                <p className="text-sm text-slate-500 text-center">
                  Cleaning verification complete. All bins have been marked as cleaned.
                </p>

                <div className="w-full max-w-xs mt-6 p-3 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    Verification Successful
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 text-sm">Cleaning Summary</h4>
                <div className="space-y-2">
                  {sampleOffice.bins.map((bin) => (
                    <div
                      key={bin.id}
                      className="flex items-center p-3 rounded-lg transition-all duration-200"
                      style={{ backgroundColor: bin.lightColor }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: bin.color }}
                      >
                        <span className="text-white text-xs font-medium">
                          {bin.type.split(' ')[0].charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-slate-700 flex-1">{bin.type}</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={resetProcess}
                className="w-full h-11 text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </main>

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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
}

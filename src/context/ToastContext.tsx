import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'info': return <Info size={20} />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success': return { bg: '#10B981', border: '#059669' };
      case 'error': return { bg: '#EF4444', border: '#DC2626' };
      case 'warning': return { bg: '#F59E0B', border: '#D97706' };
      case 'info': return { bg: '#3B82F6', border: '#2563EB' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '400px'
      }}>
        {toasts.map(toast => {
          const colors = getColors(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                background: 'white',
                borderLeft: `4px solid ${colors.bg}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: '300px',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <div style={{ color: colors.bg }}>
                {getIcon(toast.type)}
              </div>
              <p style={{ 
                flex: 1, 
                fontSize: '0.875rem', 
                color: '#374151',
                margin: 0 
              }}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: '#6B7280'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

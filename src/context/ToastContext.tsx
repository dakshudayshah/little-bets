import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import '../styles/Toast.css';

interface Toast {
  id: number;
  message: string;
}

interface ToastContextType {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className="toast">{t.message}</div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

import { useCallback, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error';

export type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

const DISMISS_MS = 3500;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    counter.current += 1;
    const id = counter.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DISMISS_MS);
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);

  return { toasts, success, error };
}

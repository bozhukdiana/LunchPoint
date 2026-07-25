import type { Toast } from '@/features/student/hooks/useToast';

type ToasterProps = {
  toasts: Toast[];
};

export function Toaster({ toasts }: ToasterProps) {
  if (toasts.length === 0) return null;

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-4 z-50 flex flex-col gap-2 sm:right-6">
      {toasts.map((toast) => (
        <div
          className={`pointer-events-auto max-w-xs rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.variant === 'success' ? 'bg-emerald-700 text-white' : 'bg-red-600 text-white'
          }`}
          key={toast.id}
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

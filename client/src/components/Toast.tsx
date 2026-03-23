import { useToast } from '../context/ToastContext';

const STYLES = {
  success: { bar: 'bg-emerald-500', text: 'text-emerald-300', icon: '✓' },
  error: { bar: 'bg-red-500', text: 'text-red-300', icon: '✕' },
  info: { bar: 'bg-indigo-500', text: 'text-indigo-300', icon: 'i' },
};

export function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const s = STYLES[toast.type];
        return (
          <div key={toast.id} role="alert"
            className="pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-2xl animate-[slideUp_0.2s_ease-out]"
            style={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.09)', minWidth: '260px', maxWidth: '380px', backdropFilter: 'blur(12px)' }}>
            <span className={`w-5 h-5 rounded-full ${s.bar} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
              {s.icon}
            </span>
            <span className="flex-1 text-slate-200 text-xs">{toast.message}</span>
            <button type="button" aria-label="Close" onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-600 hover:text-slate-300 transition cursor-pointer">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

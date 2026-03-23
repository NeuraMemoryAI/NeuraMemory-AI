interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ open, title, description, confirmLabel, loading, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/70" style={{ backdropFilter: 'blur(8px)' }} onClick={onCancel} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl animate-fade-in"
        style={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.09)' }}>
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <p className="text-sm text-slate-400 mt-1.5">{description}</p>
        </div>
        <div className="flex justify-end gap-2.5 mt-1">
          <button type="button" onClick={onCancel} disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/8 border border-white/7 text-slate-300 transition disabled:opacity-50 cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer">
            {loading && (
              <svg className="animate-spin" width="12" height="12" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

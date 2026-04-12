import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthApiError } from '@supabase/supabase-js';

import { forgetPassword } from '../../utils/supabase';

/* ─────────────────────────────────────────────
   Inline styles for animations not in Tailwind
───────────────────────────────────────────── */
const fadeIn: React.CSSProperties = {
  animation: 'fp-fadeSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
};

const spinnerStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  border: '2.5px solid rgba(255,255,255,0.25)',
  borderTopColor: '#fff',
  borderRadius: '50%',
  animation: 'fp-spin 0.7s linear infinite',
  display: 'inline-block',
};

/* ─────────────────────────────────────────────
   Mail icon (SVG, no extra deps)
───────────────────────────────────────────── */
const MailIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

/* ─────────────────────────────────────────────
   Check icon for success state
───────────────────────────────────────────── */
const CheckIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ─────────────────────────────────────────────
   Arrow-left icon for back button
───────────────────────────────────────────── */
const ArrowLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

/* ═══════════════════════════════════════════
   ForgetPassword Component
═══════════════════════════════════════════ */
const ForgetPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const email = (data.get('email') as string).trim();

    setError('');
    setLoading(true);

    try {
      const { error: sbError } = await forgetPassword(email);
      if (sbError) throw sbError;
      setSentTo(email);
      setSent(true);
    } catch (err) {
      const message =
        err instanceof AuthApiError
          ? (err.message ?? 'Something went wrong. Please try again.')
          : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes fp-fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fp-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fp-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .fp-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 48px 13px 44px;
          color: #fff;
          font-size: 0.95rem;
          width: 100%;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .fp-input::placeholder { color: rgba(255,255,255,0.3); }
        .fp-input:focus {
          border-color: rgba(99,102,241,0.7);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .fp-btn {
          position: relative;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
        }
        .fp-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        }
        .fp-btn:active:not(:disabled) { transform: translateY(0); }
        .fp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .fp-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.45);
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }
        .fp-back:hover { color: rgba(255,255,255,0.75); }
        .fp-success-icon {
          width: 68px; height: 68px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          box-shadow: 0 4px 32px rgba(99,102,241,0.45);
          animation: fp-pop 0.5s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.05s;
        }
      `}</style>

      <main
        className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
        style={{ background: '#09090b' }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            ...fadeIn,
            width: '100%',
            maxWidth: 440,
            background:
              'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 24,
            padding: '40px 36px',
            backdropFilter: 'blur(16px)',
            boxShadow:
              '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* ── SUCCESS STATE ── */}
          {sent ? (
            <div
              className="flex flex-col items-center gap-5 text-center"
              style={fadeIn}
            >
              <div className="fp-success-icon">
                <CheckIcon />
              </div>

              <div className="flex flex-col gap-2">
                <h1
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Check your inbox
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
                  We sent a password reset link to{' '}
                  <span style={{ color: 'rgba(165,180,252,0.9)', fontWeight: 600 }}>
                    {sentTo}
                  </span>
                  . It expires in 60 minutes.
                </p>
              </div>

              <div
                style={{
                  width: '100%',
                  height: 1,
                  background: 'rgba(255,255,255,0.07)',
                  margin: '4px 0',
                }}
              />

              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', margin: 0 }}>
                Didn't receive it?{' '}
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(165,180,252,0.8)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                  }}
                  onClick={() => { setSent(false); setError(''); }}
                >
                  Resend
                </button>
              </p>

              <button
                className="fp-btn"
                style={{ marginTop: 4 }}
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          ) : (
            /* ── FORM STATE ── */
            <div className="flex flex-col gap-7">
              {/* Back link */}
              <button className="fp-back" onClick={() => navigate('/login')}>
                <ArrowLeftIcon /> Back to login
              </button>

              {/* Header */}
              <div className="flex flex-col gap-1.5">
                <h1
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: '#fff',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Forgot password?
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 }}>
                  No worries — we'll send you a reset link.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="fp-email"
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Email address
                  </label>

                  {/* Input with icon */}
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <MailIcon />
                    </span>
                    <input
                      id="fp-email"
                      name="email"
                      type="email"
                      autoFocus
                      required
                      placeholder="you@example.com"
                      className="fp-input"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: '#fca5a5',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    role="alert"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  id="fp-submit"
                  type="submit"
                  disabled={loading}
                  className="fp-btn"
                >
                  {loading ? (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                      }}
                    >
                      <span style={spinnerStyle} />
                      Sending link…
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Footer */}
              <p
                style={{
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.8rem',
                  margin: 0,
                }}
              >
                Remember your password?{' '}
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(165,180,252,0.85)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ForgetPassword;

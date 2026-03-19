import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setLoading(true);
      // Store user data in localStorage
      setTimeout(() => {
        localStorage.setItem('neura_user', JSON.stringify({ email, password }));
        localStorage.setItem('neura_logged_in', 'true');
        setLoading(false);
        navigate('/');
      }, 1200);
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black px-4 py-12 overflow-hidden">
      {/* Faded overlay background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 pointer-events-none" style={{zIndex: 0}} />
      <div className="relative w-full max-w-xl bg-neutral-900 rounded-3xl shadow-2xl border border-gray-800 p-10 flex flex-col gap-8 animate-fade-in" style={{zIndex: 1}}>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-extrabold text-white mb-1">Create account</h1>
          <p className="text-gray-400 text-sm">Sign up to get started with NeuraMemoryAI.</p>
        </div>
        <form className="flex flex-col gap-6" onSubmit={handleSignup}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-300 text-xs font-medium">Email</label>
            <input
              id="email"
              type="email"
              className="bg-neutral-800 border border-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-gray-300 text-xs font-medium">Password</label>
            <input
              id="password"
              type="password"
              className="bg-neutral-800 border border-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-gray-300 text-xs font-medium">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="bg-neutral-800 border border-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 text-base font-bold transition shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center text-gray-400 text-xs mt-2">
          Already have an account?{' '}
          <button
            className="text-blue-400 hover:underline font-semibold transition"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
};

export default Signup;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        // Check if user exists
        const user = localStorage.getItem('neura_user');
        if (!user) {
          setTimeout(() => {
            setLoading(false);
            setError('You don\'t have an account. Please create an account.');
          }, 800);
          return;
        }
        // TODO: Add authentication logic here
        setTimeout(() => {
          setLoading(false);
          localStorage.setItem('neura_logged_in', 'true');
          navigate('/');
        }, 1200);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black px-4 py-12">
      <div className="w-full max-w-xl bg-neutral-900 rounded-3xl shadow-2xl border border-gray-800 p-10 flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-extrabold text-white mb-1">Sign in to NeuraMemoryAI</h1>
          <p className="text-gray-400 text-base">Welcome back! Please enter your details.</p>
        </div>
        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-300 text-sm font-medium">Email</label>
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
            <label htmlFor="password" className="text-gray-300 text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              className="bg-neutral-800 border border-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 text-base font-bold transition shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'LogIn'}
          </button>
        </form>
        <div className="text-center text-gray-400 text-sm mt-2">
          Don&apos;t have an account?{' '}
          <button
            className="text-blue-400 hover:underline font-semibold transition"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </button>
        </div>
      </div>
    </main>
  );
};

export default Login;

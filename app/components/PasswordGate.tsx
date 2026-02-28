'use client';

import { useState, useEffect } from 'react';

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('app_password');
    if (saved) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    // Save password - actual validation happens server-side
    localStorage.setItem('app_password', password);
    setIsAuthenticated(true);
  };

  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100  p-4">
        <div className="bg-white  p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2 text-black">Nutrition Tracker</h2>
          <p className="text-black dark:text-gray-300 mb-6">Enter password to continue</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-black"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}

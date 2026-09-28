import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const adminCode = import.meta.env.VITE_ADMIN_CODE || 'ADMIN1'; // Default if env missing

  useEffect(() => {
    const auth = localStorage.getItem('formflow_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (code === adminCode) {
      localStorage.setItem('formflow_admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid administrator code');
      setCode('');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary-600 mb-4">
          <Lock className="w-12 h-12" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Admin Access Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter the 6-character administrator code
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Admin Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="password"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm uppercase text-center tracking-widest font-mono text-xl"
                  placeholder="XXXXXX"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Unlock Access
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

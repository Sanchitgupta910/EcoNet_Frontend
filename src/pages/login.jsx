import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../app/userSlice'; // Import setUser action

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Remember user state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch(); // Get the dispatch function from Redux

  /**
   * Auto login on page load if a token is found.
   * This effect checks for a token stored in localStorage or sessionStorage.
   * If found, it sets the default authorization header, fetches the user details,
   * updates the Redux store, and then redirects based on the user role.
   */
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch user details from the backend
      axios
        .get('/api/v1/users/me', { withCredentials: true })
        .then((response) => {
          const user = response.data.data.user;
          // Dispatch the user data to Redux
          dispatch(setUser(user));
          // Redirect based on role
          if (user.role === "SuperAdmin") {
            window.location.href = '/companies';
          } else {
            window.location.href = '/DashboardPage';
          }
        })
        .catch((err) => {
          console.error('Auto-login failed: ', err);
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
        });
    }
  }, [dispatch]);

  /**
   * handleLogin:
   * - Prevents the default form submission.
   * - Sends a login request to the backend with email, password, and rememberMe.
   * - If successful, dispatches the user data to Redux.
   * - Redirects the user based on their role: SuperAdmin goes to /companies,
   *   while normal Admin goes to /dashboard.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Make a login request to the backend; include rememberMe if needed by your backend
      const response = await axios.post('/api/v1/users/login', { email, password, rememberMe }, { withCredentials: true });

      // Check if the response contains the user data
      if (response.data.data.user) {
        const user = response.data.data.user;
        // Dispatch the user data to Redux
        dispatch(setUser(user));
        console.log('User set in Redux:', user);

        // Role-based redirection
        if (user.role === "SuperAdmin") {
          window.location.href = '/companies';
        } else {
          window.location.href = '/DashboardPage';
        }
      } else {
        setError("Failed to retrieve user information. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      console.error('Error during login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Logo Section */}
        <div className="flex justify-center">
          <img
            src="src/assets/NetNada_logo.png" 
            alt="Logo"
            className="h-16" // Adjust height as needed
          />
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Account Login</h1>
          <p className="text-gray-500">Welcome back! Please enter your details.</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-primary text-sky-800">Forgot password?</a>
          </div>
          <button
            type="submit"
            className="w-full bg-[#2c7be5] hover:bg-[#225bbd] text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

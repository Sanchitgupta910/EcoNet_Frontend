// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { EyeIcon, EyeOffIcon } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { setUser } from '../app/userSlice'; // Redux action to store user data

// export default function LoginPage() {
//   // --------------------- Component State --------------------- //
//   // User credentials and form states
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   // Toggles the visibility of the password input
//   const [showPassword, setShowPassword] = useState(false);
//   // Whether to remember the user across sessions
//   const [rememberMe, setRememberMe] = useState(false);
//   // Error message to display for any login failures
//   const [error, setError] = useState(null);
//   // Loading state for form submission
//   const [loading, setLoading] = useState(false);

//   // --------------------- Redux & Navigation Hooks --------------------- //
//   const dispatch = useDispatch(); // Redux dispatch function
//   const navigate = useNavigate(); // React Router's navigation function

//   // --------------------- Auto-Login Effect --------------------- //
//   /**
//    * On component mount, check if a token exists in localStorage or sessionStorage.
//    * If a token is found, set the default authorization header and attempt to fetch the
//    * current user details. On success, store the user data in Redux and redirect based on role.
//    */
//   useEffect(() => {
//     const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
//     if (token) {
//       // Set default authorization header for all Axios requests
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//       // Define an asynchronous function for auto-login
//       const autoLogin = async () => {
//         try {
//           // Fetch current user details
//           const response = await axios.get('/api/v1/users/me', { withCredentials: true });
//           const user = response.data.data.user;

//           // Dispatch user data to Redux store
//           dispatch(setUser(user));

//           // Redirect user based on their role
//           if (user.role === "SuperAdmin") {
//             navigate('/companies');
//           } else {
//             navigate('/DashboardPage');
//           }
//         } catch (err) {
//           console.error('Auto-login failed: ', err);
//           // If auto-login fails, remove stored tokens
//           localStorage.removeItem('accessToken');
//           sessionStorage.removeItem('accessToken');
//         }
//       };

//       autoLogin();
//     }
//   }, [dispatch, navigate]);

//   // --------------------- Login Handler --------------------- //
//   /**
//    * Handles form submission for logging in.
//    * - Prevents default form submission.
//    * - Sends a login request to the backend with email, password, and rememberMe.
//    * - On success, dispatches user data to Redux and redirects based on user role.
//    * - On failure, sets an error message.
//    */
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // Make a login request to the backend
//       const response = await axios.post(
//         '/api/v1/users/login',
//         { email, password, rememberMe },
//         { withCredentials: true }
//       );

//       // Check if the response contains the user data
//       if (response.data.data.user) {
//         const user = response.data.data.user;
//         // Dispatch the user data to Redux
//         dispatch(setUser(user));
//         console.log('User set in Redux:', user);

//         // Redirect based on user role
//         if (user.role === "SuperAdmin") {
//           navigate('/companies');
//         } else {
//           navigate('/DashboardPage');
//         }
//       } else {
//         // Handle unexpected missing user data
//         setError("Failed to retrieve user information. Please try again.");
//       }
//     } catch (err) {
//       // Display error message from response or a default message
//       setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
//       console.error('Error during login:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --------------------- Component Rendering --------------------- //
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-sky-50">
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
//         {/* Logo Section */}
//         <div className="flex justify-center">
//           <img
//             src="src/assets/NetNada_logo.png"
//             alt="Logo"
//             className="h-16" // Adjust height as needed
//           />
//         </div>

//         {/* Heading Section */}
//         <div className="space-y-2 text-center">
//           <h1 className="text-3xl font-bold text-gray-900">Account Login</h1>
//           <p className="text-gray-500">Welcome back! Please enter your details.</p>
//         </div>

//         {/* Login Form */}
//         <form className="space-y-4" onSubmit={handleLogin}>
//           {/* Email Input */}
//           <div className="space-y-2">
//             <label htmlFor="email" className="text-gray-700">Email</label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
//               required
//             />
//           </div>

//           {/* Password Input with Visibility Toggle */}
//           <div className="space-y-2">
//             <label htmlFor="password" className="text-gray-700">Password</label>
//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
//                 required
//               />
//               {/* Toggle button for password visibility */}
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
//               >
//                 {showPassword ? (
//                   <EyeOffIcon className="h-5 w-5" />
//                 ) : (
//                   <EyeIcon className="h-5 w-5" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Display error message if any */}
//           {error && <p className="text-red-500 text-sm">{error}</p>}

//           {/* Remember Me and Forgot Password Section */}
//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
//               />
//               <span className="ml-2 text-sm text-gray-600">Remember me</span>
//             </label>
//             <a href="#" className="text-sm text-primary text-sky-800">Forgot password?</a>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-[#2c7be5] hover:bg-[#225bbd] text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
//             disabled={loading}
//           >
//             {loading ? 'Logging in...' : 'Log in'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setUser } from '../app/userSlice'; // Redux action to store user data

export default function LoginPage() {
  // --------------------- Component State --------------------- //
  // User credentials and form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Toggles the visibility of the password input
  const [showPassword, setShowPassword] = useState(false);
  // Whether to remember the user across sessions
  const [rememberMe, setRememberMe] = useState(false);
  // Error message to display for any login failures
  const [error, setError] = useState(null);
  // Loading state for form submission
  const [loading, setLoading] = useState(false);

  // --------------------- Redux & Navigation Hooks --------------------- //
  const dispatch = useDispatch(); // Redux dispatch function
  const navigate = useNavigate(); // React Router's navigation function

  // --------------------- Auto-Login Effect --------------------- //
  /**
   * On component mount, check if a token exists in localStorage or sessionStorage.
   * If a token is found, set the default authorization header and attempt to fetch the
   * current user details. On success, store the user data in Redux and redirect based on role.
   */
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      // Set default authorization header for all Axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Define an asynchronous function for auto-login
      const autoLogin = async () => {
        try {
          // Fetch current user details
          const response = await axios.get('/api/v1/users/me', { withCredentials: true });
          const user = response.data.data.user;

          // Dispatch user data to Redux store
          dispatch(setUser(user));

          // Redirect user based on their role
          if (user.role === 'SuperAdmin') {
            navigate('/companies');
          } else {
            navigate('/DashboardPage');
          }
        } catch (err) {
          console.error('Auto-login failed: ', err);
          // If auto-login fails, remove stored tokens
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
        }
      };

      autoLogin();
    }
  }, [dispatch, navigate]);

  // --------------------- Login Handler --------------------- //
  /**
   * Handles form submission for logging in.
   * - Prevents default form submission.
   * - Sends a login request to the backend with email, password, and rememberMe.
   * - On success, dispatches user data to Redux and redirects based on user role.
   * - On failure, sets an error message.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Make a login request to the backend
      const response = await axios.post(
        '/api/v1/users/login',
        { email, password, rememberMe },
        { withCredentials: true },
      );

      // Check if the response contains the user data
      if (response.data.data.user) {
        const user = response.data.data.user;
        // Dispatch the user data to Redux
        dispatch(setUser(user));
        console.log('User set in Redux:', user);

        // Redirect based on user role
        if (user.role === 'SuperAdmin') {
          navigate('/companies');
        } else {
          navigate('/DashboardPage');
        }
      } else {
        // Handle unexpected missing user data
        setError('Failed to retrieve user information. Please try again.');
      }
    } catch (err) {
      // Display error message from response or a default message
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      console.error('Error during login:', err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------- Component Rendering --------------------- //
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] ">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Logo Section */}
        <div className="flex justify-center">
          <img
            src="src/assets/NetNada_logo.png"
            alt="Logo"
            className="h-16" // Adjust height as needed
          />
        </div>

        {/* Heading Section */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Account Login</h1>
          <p className="text-gray-500">Welcome back! Please enter your details.</p>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-700">
              Email
            </label>
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

          {/* Password Input with Visibility Toggle */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
              {/* Toggle button for password visibility */}
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

          {/* Display error message if any */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Remember Me and Forgot Password Section */}
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
            <Link to="/password-reset-request" className="text-sm text-primary text-sky-800">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

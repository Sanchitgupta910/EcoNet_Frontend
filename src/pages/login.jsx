// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { EyeIcon, EyeOffIcon } from 'lucide-react';
// // import { useDispatch } from 'react-redux';
// // import { useNavigate, Link } from 'react-router-dom';
// // import { setUser } from '../app/userSlice'; // Redux action to store user data

// // export default function LoginPage() {
// //   // --------------------- Component State --------------------- //
// //   // User credentials and form states
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   // Toggles the visibility of the password input
// //   const [showPassword, setShowPassword] = useState(false);
// //   // Whether to remember the user across sessions
// //   const [rememberMe, setRememberMe] = useState(false);
// //   // Error message to display for any login failures
// //   const [error, setError] = useState(null);
// //   // Loading state for form submission
// //   const [loading, setLoading] = useState(false);

// //   // --------------------- Redux & Navigation Hooks --------------------- //
// //   const dispatch = useDispatch(); // Redux dispatch function
// //   const navigate = useNavigate(); // React Router's navigation function

// //   // --------------------- Auto-Login Effect --------------------- //
// //   /**
// //    * On component mount, check if a token exists in localStorage or sessionStorage.
// //    * If a token is found, set the default authorization header and attempt to fetch the
// //    * current user details. On success, store the user data in Redux and redirect based on role.
// //    */
// //   useEffect(() => {
// //     const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
// //     if (token) {
// //       // Set default authorization header for all Axios requests
// //       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// //       // Define an asynchronous function for auto-login
// //       const autoLogin = async () => {
// //         try {
// //           // Fetch current user details
// //           const response = await axios.get('/api/v1/users/me', { withCredentials: true });
// //           const user = response.data.data.user;

// //           // Dispatch user data to Redux store
// //           dispatch(setUser(user));

// //           // Redirect user based on their role
// //           if (user.role === 'SuperAdmin') {
// //             navigate('/companies');
// //           } else {
// //             navigate('/DashboardPage');
// //           }
// //         } catch (err) {
// //           console.error('Auto-login failed: ', err);
// //           // If auto-login fails, remove stored tokens
// //           localStorage.removeItem('accessToken');
// //           sessionStorage.removeItem('accessToken');
// //         }
// //       };

// //       autoLogin();
// //     }
// //   }, [dispatch, navigate]);

// //   // --------------------- Login Handler --------------------- //
// //   /**
// //    * Handles form submission for logging in.
// //    * - Prevents default form submission.
// //    * - Sends a login request to the backend with email, password, and rememberMe.
// //    * - On success, dispatches user data to Redux and redirects based on user role.
// //    * - On failure, sets an error message.
// //    */
// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError(null);

// //     try {
// //       // Make a login request to the backend
// //       const response = await axios.post(
// //         '/api/v1/users/login',
// //         { email, password, rememberMe },
// //         { withCredentials: true },
// //       );

// //       // Check if the response contains the user data
// //       if (response.data.data.user) {
// //         const user = response.data.data.user;
// //         // Dispatch the user data to Redux
// //         dispatch(setUser(user));
// //         console.log('User set in Redux:', user);

// //         // Redirect based on user role
// //         if (user.role === 'SuperAdmin') {
// //           navigate('/companies');
// //         } else {
// //           navigate('/DashboardPage');
// //         }
// //       } else {
// //         // Handle unexpected missing user data
// //         setError('Failed to retrieve user information. Please try again.');
// //       }
// //     } catch (err) {
// //       // Display error message from response or a default message
// //       setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
// //       console.error('Error during login:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // --------------------- Component Rendering --------------------- //
// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] ">
// //       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
// //         {/* Logo Section */}
// //         <div className="flex justify-center">
// //           <img
// //             src="src/assets/NetNada_logo.png"
// //             alt="Logo"
// //             className="h-16" // Adjust height as needed
// //           />
// //         </div>

// //         {/* Heading Section */}
// //         <div className="space-y-2 text-center">
// //           <h1 className="text-3xl font-bold text-gray-900">Account Login</h1>
// //           <p className="text-gray-500">Welcome back! Please enter your details.</p>
// //         </div>

// //         {/* Login Form */}
// //         <form className="space-y-4" onSubmit={handleLogin}>
// //           {/* Email Input */}
// //           <div className="space-y-2">
// //             <label htmlFor="email" className="text-gray-700">
// //               Email
// //             </label>
// //             <input
// //               id="email"
// //               type="email"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               placeholder="Enter your email"
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
// //               required
// //             />
// //           </div>

// //           {/* Password Input with Visibility Toggle */}
// //           <div className="space-y-2">
// //             <label htmlFor="password" className="text-gray-700">
// //               Password
// //             </label>
// //             <div className="relative">
// //               <input
// //                 id="password"
// //                 type={showPassword ? 'text' : 'password'}
// //                 value={password}
// //                 onChange={(e) => setPassword(e.target.value)}
// //                 placeholder="Enter your password"
// //                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
// //                 required
// //               />
// //               {/* Toggle button for password visibility */}
// //               <button
// //                 type="button"
// //                 onClick={() => setShowPassword(!showPassword)}
// //                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
// //               >
// //                 {showPassword ? (
// //                   <EyeOffIcon className="h-5 w-5" />
// //                 ) : (
// //                   <EyeIcon className="h-5 w-5" />
// //                 )}
// //               </button>
// //             </div>
// //           </div>

// //           {/* Display error message if any */}
// //           {error && <p className="text-red-500 text-sm">{error}</p>}

// //           {/* Remember Me and Forgot Password Section */}
// //           <div className="flex items-center justify-between">
// //             <label className="flex items-center">
// //               <input
// //                 type="checkbox"
// //                 checked={rememberMe}
// //                 onChange={(e) => setRememberMe(e.target.checked)}
// //                 className="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
// //               />
// //               <span className="ml-2 text-sm text-gray-600">Remember me</span>
// //             </label>
// //             <Link to="/password-reset-request" className="text-sm text-primary text-sky-800">
// //               Forgot password?
// //             </Link>
// //             {/* <Link to="/password-reset" className="text-sm text-primary text-sky-800">
// //               Forgot password?
// //             </Link> */}
// //           </div>

// //           {/* Submit Button */}
// //           <button
// //             type="submit"
// //             className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
// //             disabled={loading}
// //           >
// //             {loading ? 'Logging in...' : 'Log in'}
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { EyeIcon, EyeOffIcon } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { setUser } from '../app/userSlice'; // Redux action to store user data

// /**
//  * LoginPage component handles user login.
//  * On successful login, it stores the user's role in sessionStorage
//  * and navigates to the appropriate dashboard route.
//  */
// export default function LoginPage() {
//   // Component state for login form fields and UI feedback.
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Redux and navigation hooks.
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Auto-login effect: if token exists in sessionStorage, try to auto-login.
//   useEffect(() => {
//     const token = sessionStorage.getItem('accessToken');
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       const autoLogin = async () => {
//         try {
//           const response = await axios.get('/api/v1/users/me', { withCredentials: true });
//           const user = response.data.data.user;
//           dispatch(setUser(user));
//           // Store user role in sessionStorage.
//           sessionStorage.setItem('userRole', user.role);
//           // Redirect: SuperAdmin goes to Companies, others to Dashboard.
//           if (user.role === 'SuperAdmin') {
//             navigate('/companies');
//           } else {
//             navigate('/dashboard');
//           }
//         } catch (err) {
//           console.error('Auto-login failed:', err);
//           sessionStorage.removeItem('accessToken');
//           sessionStorage.removeItem('userRole');
//         }
//       };
//       autoLogin();
//     }
//   }, [dispatch, navigate]);

//   /**
//    * Handle form submission for login.
//    * It sends credentials to the backend, processes the response,
//    * saves the user's role in sessionStorage, dispatches user data, and navigates accordingly.
//    */
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // Send login request to the backend.
//       const response = await axios.post(
//         '/api/v1/users/login',
//         { email, password, rememberMe },
//         { withCredentials: true },
//       );

//       // Check for valid user data.
//       if (response.data.data.user) {
//         const user = response.data.data.user;
//         // Dispatch user data to Redux store.
//         dispatch(setUser(user));
//         // Store user role in sessionStorage.
//         sessionStorage.setItem('userRole', user.role);
//         // Redirect based on user role:
//         // - SuperAdmin navigates to companies page.
//         // - EmployeeDashboardUser and BinDisplayUser, as well as other admin roles, navigate to dashboard.
//         if (user.role === 'SuperAdmin') {
//           navigate('/companies');
//         } else {
//           navigate('/dashboard');
//         }
//       } else {
//         setError('Failed to retrieve user information. Please try again.');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
//       console.error('Error during login:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
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
//             <label htmlFor="email" className="text-gray-700">
//               Email
//             </label>
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
//             <label htmlFor="password" className="text-gray-700">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
//                 required
//               />
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

//           {/* Display error message */}
//           {error && <p className="text-red-500 text-sm">{error}</p>}

//           {/* Remember Me and Forgot Password */}
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
//             <Link to="/password-reset-request" className="text-sm text-primary text-sky-800">
//               Forgot password?
//             </Link>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
//             disabled={loading}
//           >
//             {loading ? 'Logging in...' : 'Log in'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Package2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../app/userSlice'; // Redux action to store user data

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from '@/components/ui/theme-provider';

export default function Login() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Component state for login form fields and UI feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-login effect: if token exists in sessionStorage, try to auto-login
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

          // Store user role in sessionStorage
          sessionStorage.setItem('userRole', user.role);

          // Redirect user based on their role
          if (user.role === 'SuperAdmin') {
            navigate('/companies');
          } else {
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Auto-login failed: ', err);
          // If auto-login fails, remove stored tokens
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('userRole');
        }
      };

      autoLogin();
    }
  }, [dispatch, navigate]);

  /**
   * Handle form submission for login.
   * It sends credentials to the backend, processes the response,
   * saves the user's role in sessionStorage, dispatches user data, and navigates accordingly.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send login request to the backend
      const response = await axios.post(
        '/api/v1/users/login',
        { email, password, rememberMe },
        { withCredentials: true },
      );

      // Check for valid user data
      if (response.data.data.user) {
        const user = response.data.data.user;
        // Dispatch user data to Redux store
        dispatch(setUser(user));
        console.log('User set in Redux:', user);

        // Store user role in sessionStorage
        sessionStorage.setItem('userRole', user.role);

        // Redirect based on user role
        if (user.role === 'SuperAdmin') {
          navigate('/companies');
        } else {
          navigate('/dashboard');
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Package2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Account Login</CardTitle>
          <CardDescription>Welcome back! Please enter your details to sign in.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe} />
                <Label htmlFor="rememberMe" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Link
                to="/password-reset-request"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <button
                type="button"
                className="underline hover:text-primary"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                Toggle theme
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

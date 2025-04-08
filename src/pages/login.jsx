'use client';

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Package2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../app/userSlice'; // Redux action to store user data
import NetnadaLogo from '@/assets/NetNada_logo.png';
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
            navigate('/dashboard');
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
            <img
              src={NetnadaLogo || '/placeholder.svg'}
              alt="EcoNet Logo"
              className="h-12 w-auto mt-5"
            />
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
            <div className="space-y-2 ">
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
                <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe}  />
                <Label htmlFor="rememberMe" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Link
                to="/password-reset-request"
                className="text-sm font-medium text-indigo-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

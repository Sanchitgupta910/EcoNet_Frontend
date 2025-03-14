'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';

/**
 * Password Reset Page Component
 * Allows users to set a new password after receiving a reset link.
 * @param {Object} props - Component props containing URL parameters.
 * @param {Object} props.params - URL parameters including reset token.
 * @returns {JSX.Element} - Password reset page.
 */
export default function PasswordResetPage({ params }) {
  const navigate = useNavigate();
  const { token } = params;

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if passwords match
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  /**
   * Simulate fetching the email associated with the reset token.
   * In a real app, validate the token with the backend.
   */
  useEffect(() => {
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        email: 'user@example.com',
      }));
    }, 500);
  }, [token]);

  /**
   * Handle form field changes.
   * @param {string} field - Field name.
   * @param {string} value - New field value.
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError('');
  };

  /**
   * Handle form submission.
   * @param {Event} e - Form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that passwords match
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to reset the password
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <KeyRound className="mr-2 h-5 w-5 text-primary" /> Reset Your Password
            </CardTitle>
            <CardDescription>Create a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Password reset successful! Redirecting you to the login page...
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {/* Email Field - Non-editable */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter>
            {!isSuccess && (
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !passwordsMatch}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

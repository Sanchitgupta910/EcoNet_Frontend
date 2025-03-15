'use client';

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, UserCheck } from 'lucide-react';

/**
 * User Setup Page Component
 * This page allows an invited user to complete their account setup.
 * It extracts the invitation token from the URL query parameters, then submits
 * the user's full name, password, and phone (optional) to the /api/v1/users/completeRegistration endpoint.
 */
export default function UserSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract the invitation token from the URL
  const token = searchParams.get('token') || '';

  // Optionally, if you also want to display the invited email, you can extract it:
  const email = searchParams.get('email') || '';

  // Form state for account setup
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    phone: '',
    acceptTerms: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle changes to form fields.
   * @param {string} field - Field name.
   * @param {*} value - New field value.
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle form submission.
   * This function calls the completeRegistration endpoint with the invitation token
   * and the entered account details.
   * On success, the user is navigated to the login page.
   * @param {Event} e - Form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If no token is present, do not proceed
    if (!token) {
      setError('Invitation token is missing.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/v1/users/completeRegistration',
        {
          token,
          fullName: formData.fullName,
          password: formData.password,
          phone: formData.phone,
        },
        { withCredentials: true },
      );

      // On success, redirect to login
      navigate('/login');
    } catch (err) {
      console.error('Error completing registration:', err);
      setError(
        err.response?.data?.message ||
          'An error occurred during account creation. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] items-center justify-center p-4">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="shadow-sm w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <UserCheck className="mr-2 h-5 w-5 text-primary" /> Create Your Account
            </CardTitle>
            <CardDescription>
              Complete your profile to finish setting up your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field - Non-editable */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  This email was used for your invitation
                </p>
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                />
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
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

              {/* Phone Number Field - Optional */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleChange('acceptTerms', checked)}
                  required
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I accept the{' '}
                  <a
                    href="https://www.netnada.com/netnada-terms-and-conditions"
                    className="text-primary underline"
                    target="_blank"
                  >
                    Terms and Conditions
                  </a>
                </Label>
              </div>

              {/* Error Message */}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !formData.acceptTerms}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

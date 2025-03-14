'use client';

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
 * Allows invited users to complete their account setup.
 * @returns {JSX.Element} - User setup page.
 */
export default function UserSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get email from URL query parameters
  const email = searchParams.get('email') || '';

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    phone: '',
    acceptTerms: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form field changes.
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
   * @param {Event} e - Form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      // In a real app, this would be an API call to create the user account
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to login page after account creation
      navigate('/login');
    } catch (error) {
      console.error('Error creating account:', error);
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
                  <a href="#" className="text-primary underline">
                    Terms and Conditions
                  </a>
                </Label>
              </div>
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

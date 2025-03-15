// // 'use client';

// // import { useState } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardFooter,
// //   CardHeader,
// //   CardTitle,
// // } from '@/components/ui/card';
// // import { Alert, AlertDescription } from '@/components/ui/alert';
// // import { KeyRound, CheckCircle } from 'lucide-react';
// // import { Link } from 'react-router-dom';

// // /**
// //  * Password Reset Request Page Component
// //  * Allows users to request a password reset link.
// //  * The page displays a description above the form and centers the form card.
// //  * A link is provided below the button to navigate back to the login page.
// //  * @returns {JSX.Element} - Password reset request page.
// //  */
// // export default function PasswordResetRequestPage() {
// //   // Form state for email input.
// //   const [email, setEmail] = useState('');

// //   // UI state for form submission and success message.
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [isSuccess, setIsSuccess] = useState(false);

// //   /**
// //    * Handle form submission.
// //    * Simulates an API call to request a password reset link.
// //    * @param {Event} e - Form submit event.
// //    */
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setIsSubmitting(true);

// //     // Simulate API call delay.
// //     try {
// //       await new Promise((resolve) => setTimeout(resolve, 1000));
// //       setIsSuccess(true);
// //     } catch (error) {
// //       console.error('Error requesting password reset:', error);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <div className="flex min-h-screen bg-[#F9FAFB] items-center justify-center p-4">
// //       <div className="max-w-md w-full space-y-6">
// //         {/* Password Reset Request Form Card */}
// //         <Card className="shadow-sm">
// //           <CardHeader>
// //             <CardTitle className="text-2xl font-bold flex items-center">
// //               <KeyRound className="mr-2 h-5 w-5 text-primary" /> Reset Password
// //             </CardTitle>
// //             <CardDescription>
// //               Please enter your email address to receive your password reset link.
// //             </CardDescription>
// //           </CardHeader>
// //           <CardContent>
// //             {isSuccess ? (
// //               // Success message after form submission
// //               <Alert className="bg-green-50 border-green-200">
// //                 <CheckCircle className="h-4 w-4 text-green-600" />
// //                 <AlertDescription className="text-green-800">
// //                   Password reset link sent! Please check your email inbox and follow the
// //                   instructions to reset your password.
// //                 </AlertDescription>
// //               </Alert>
// //             ) : (
// //               // Email input form
// //               <form onSubmit={handleSubmit} className="space-y-4">
// //                 <div className="space-y-2">
// //                   <Label htmlFor="email">Email Address</Label>
// //                   <Input
// //                     id="email"
// //                     type="email"
// //                     placeholder="user@example.com"
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                     required
// //                   />
// //                 </div>
// //               </form>
// //             )}
// //           </CardContent>
// //           <CardFooter className="flex flex-col items-center">
// //             {!isSuccess && (
// //               <Button
// //                 type="submit"
// //                 className="w-full"
// //                 disabled={isSubmitting}
// //                 onClick={handleSubmit}
// //               >
// //                 {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
// //               </Button>
// //             )}
// //             {/* Back to Login link directly below the button */}
// //             <Link to="/login" className="mt-4 text-sm text-primary hover:underline">
// //               Back to Login
// //             </Link>
// //           </CardFooter>
// //         </Card>
// //       </div>
// //     </div>
// //   );
// // }
// 'use client';

// import { useState } from 'react';
// import axios from 'axios';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { KeyRound, CheckCircle } from 'lucide-react';
// import { Link } from 'react-router-dom';

// /**
//  * PasswordResetRequestPage Component
//  * -------------------------------------------
//  * Allows users to request a password reset link by entering their email address.
//  * On form submission, it calls the backend endpoint /api/v1/users/forgotPassword.
//  * The email provided is sent to the backend, which then sends a reset link via email.
//  *
//  * @returns {JSX.Element} - The rendered password reset request page.
//  */
// export default function PasswordResetRequestPage() {
//   // State for email input.
//   const [email, setEmail] = useState('');
//   // UI state to track form submission and success.
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   /**
//    * Handle form submission to request a password reset.
//    * Calls the backend API to send a password reset email.
//    * @param {Event} e - Form submit event.
//    */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setErrorMessage('');

//     try {
//       // Send POST request to forgotPassword endpoint with email.
//       await axios.post('/api/v1/users/forgotPassword', { email });
//       // If successful, display success message.
//       setIsSuccess(true);
//     } catch (error) {
//       console.error('Error requesting password reset:', error);
//       setErrorMessage(
//         error.response?.data?.message || 'Failed to send reset link. Please try again.',
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-[#F9FAFB] items-center justify-center p-4">
//       <div className="max-w-md w-full space-y-6">
//         <Card className="shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold flex items-center">
//               <KeyRound className="mr-2 h-5 w-5 text-primary" /> Reset Password
//             </CardTitle>
//             <CardDescription>
//               Enter your email address to receive your password reset link.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {isSuccess ? (
//               // Display success alert once the email has been sent.
//               <Alert className="bg-green-50 border-green-200">
//                 <CheckCircle className="h-4 w-4 text-green-600" />
//                 <AlertDescription className="text-green-800">
//                   Password reset link sent! Please check your email inbox and follow the
//                   instructions to reset your password.
//                 </AlertDescription>
//               </Alert>
//             ) : (
//               // Display the form for entering email.
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email Address</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="user@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </div>
//                 {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}
//               </form>
//             )}
//           </CardContent>
//           <CardFooter className="flex flex-col items-center">
//             {!isSuccess && (
//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isSubmitting}
//                 onClick={handleSubmit}
//               >
//                 {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
//               </Button>
//             )}
//             <Link to="/login" className="mt-4 text-sm text-primary hover:underline">
//               Back to Login
//             </Link>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * PasswordResetRequestPage Component
 * -------------------------------------------
 * Allows users to request a password reset link by entering their email address.
 * On form submission, it calls the backend endpoint /api/v1/users/forgotPassword.
 *
 * @returns {JSX.Element} - The rendered password reset request page.
 */
export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await axios.post('/api/v1/users/forgotPassword', { email });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setErrorMessage(
        error.response?.data?.message || 'Failed to send reset link. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <KeyRound className="mr-2 h-5 w-5 text-primary" /> Reset Password
            </CardTitle>
            <CardDescription>
              Enter your email address to receive your password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Password reset link sent! Please check your email inbox and follow the
                  instructions to reset your password. You may close this tab.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
          {!isSuccess && (
            <CardFooter className="flex flex-col items-center">
              <Link to="/login" className="mt-4 text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

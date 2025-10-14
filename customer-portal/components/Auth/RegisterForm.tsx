// components/auth/RegisterForm.tsx

'use client';

import { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void; // Add this prop
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { emailLogin, googleLogin } = useAuth(); // Use AuthContext methods

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // For now, we'll use emailLogin since we don't have a separate register method
      // In a real app, you'd have a separate registration endpoint
      await emailLogin(formData.email, formData.password);
      
      // Call onSuccess to close the modal
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const authError = error as { code?: string; message?: string };
      
      switch (authError.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled');
          break;
        default:
          setError('Failed to create account. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    
    try {
      await googleLogin();
      // Call onSuccess to close the modal
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Google registration error:', error);
      const authError = error as { code?: string; message?: string };
      
      switch (authError.code) {
        case 'auth/popup-closed-by-user':
          // User closed the popup, no need to show error
          break;
        case 'auth/popup-blocked':
          setError('Popup was blocked by your browser. Please allow popups for this site');
          break;
        case 'auth/unauthorized-domain':
          setError('This domain is not authorized for Google sign-in');
          break;
        default:
          setError('Failed to sign up with Google. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm backdrop-blur-sm">
          {error}
        </div>
      )}
      
      <form className="space-y-4" onSubmit={handleEmailRegister}>
        {/* First Name and Last Name in a grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Input
                name="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl pl-10 py-6 backdrop-blur-sm focus:bg-white/15 focus:border-white/30 transition-all"
                required
                disabled={loading}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            </div>
          </div>
          <div>
            <div className="relative">
              <Input
                name="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl pl-10 py-6 backdrop-blur-sm focus:bg-white/15 focus:border-white/30 transition-all"
                required
                disabled={loading}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            </div>
          </div>
        </div>

        <div>
          <div className="relative">
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl pl-10 py-6 backdrop-blur-sm focus:bg-white/15 focus:border-white/30 transition-all"
              required
              disabled={loading}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          </div>
        </div>

        <div>
          <div className="relative">
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl pl-10 py-6 backdrop-blur-sm focus:bg-white/15 focus:border-white/30 transition-all"
              required
              disabled={loading}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          </div>
        </div>

        <div>
          <div className="relative">
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl pl-10 py-6 backdrop-blur-sm focus:bg-white/15 focus:border-white/30 transition-all"
              required
              disabled={loading}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 group disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Creating account...'
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      {/* Fixed Divider - No line crossing */}
      <div className="relative flex items-center justify-center my-6">
        <div className="flex-grow border-t border-white/20"></div>
        <span className="flex-shrink mx-4 text-white/60 text-sm">Or continue with</span>
        <div className="flex-grow border-t border-white/20"></div>
      </div>

      {/* Google Button */}
      <Button
        onClick={handleGoogleRegister}
        disabled={loading}
        className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </Button>

      <div className="text-center text-white/70">
        <span>Already have an account? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-300 hover:text-blue-200 font-semibold transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
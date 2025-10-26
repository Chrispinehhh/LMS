"use client";

import { useAuth } from "../../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useCallback, useEffect } from "react";

export default function LoginPage() {
  const { login, emailLogin, loading } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);

  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Password validation
  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Reset attempts on successful input changes
  useEffect(() => {
    if (email || password) {
      setAttempts(0);
      setIsLocked(false);
    }
  }, [email, password]);

  // Handle lock countdown
  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      setLockTime(prev => {
        if (prev <= 1000) {
          setIsLocked(false);
          setAttempts(0);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  const handleForgotPassword = useCallback(async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // For now, just show a message since sendPasswordResetEmail is not in AuthContext
      setSuccess("Password reset feature coming soon. Please contact your administrator.");
      console.log("Password reset requested for:", email);
    } catch (err: unknown) { 
      const errorMessage = "Failed to send reset email. Please try again.";
      setError(errorMessage);
      console.error(err);
    }
  }, [email]);

  const handleEmailLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check if account is temporarily locked
    if (isLocked) {
      const minutes = Math.ceil(lockTime / 60000);
      setError(`Too many failed attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`);
      return;
    }

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!emailLogin) {
      setError("Login functionality not available");
      return;
    }

    try {
      // Call emailLogin with only 2 arguments (email and password)
      await emailLogin(email, password);
      // Reset attempts on successful login
      setAttempts(0);
    } catch (err: unknown) { 
      // Increment attempts on failure
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      let errorMessage = "Failed to log in. Please try again.";

      if (typeof err === 'object' && err !== null && 'code' in err) {
        const errorCode = (err as { code: string }).code; 
        
        if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
          errorMessage = "Invalid email or password.";
          
          // Lock account after max attempts
          if (newAttempts >= MAX_ATTEMPTS) {
            setIsLocked(true);
            setLockTime(LOCK_TIME);
            const minutes = LOCK_TIME / 60000;
            errorMessage = `Too many failed attempts. Account temporarily locked. Please try again in ${minutes} minutes.`;
          } else {
            errorMessage = `Invalid email or password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`;
          }
        } else if (errorCode === 'auth/too-many-requests') {
          setIsLocked(true);
          setLockTime(LOCK_TIME);
          const minutes = LOCK_TIME / 60000;
          errorMessage = `Too many attempts. Account temporarily locked. Please try again in ${minutes} minutes.`;
        } else if (errorCode === 'auth/user-disabled') {
          errorMessage = "This account has been disabled. Please contact support.";
        } else if (errorCode === 'auth/network-request-failed') {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }
      
      setError(errorMessage);
      console.error(err);
    }
  }, [email, password, attempts, isLocked, lockTime, emailLogin, MAX_ATTEMPTS, LOCK_TIME]);

  const handleGoogleLogin = useCallback(async () => {
    setError("");
    setSuccess("");

    if (isLocked) {
      const minutes = Math.ceil(lockTime / 60000);
      setError(`Account temporarily locked. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`);
      return;
    }

    try {
      await login();
    } catch (err: unknown) {
      let errorMessage = "Failed to sign in with Google. Please try again.";

      if (typeof err === 'object' && err !== null && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'auth/popup-closed-by-user') {
          errorMessage = "Google sign-in was cancelled.";
        } else if (errorCode === 'auth/popup-blocked') {
          errorMessage = "Popup was blocked. Please allow popups for this site.";
        }
      }

      setError(errorMessage);
      console.error(err);
    }
  }, [login, isLocked, lockTime]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 dark:bg-sidebar/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">S&S</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                S&S Logistics
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to access your logistics dashboard
            </p>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input 
                  type="email" 
                  id="email" 
                  placeholder="employee@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLocked || loading}
                  className="h-11 bg-background/50 border-input/50 focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLocked || loading}
                    className="h-11 bg-background/50 border-input/50 focus:border-primary/50 transition-colors pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked || loading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLocked || loading}
                  className="w-4 h-4 rounded border-border focus:ring-primary/50 disabled:opacity-50"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground select-none">
                  Remember me
                </Label>
              </div>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isLocked || loading}
                className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forgot password?
              </button>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
                {success}
              </div>
            )}

            {/* Lockout Message */}
            {isLocked && (
              <div className="p-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <div className="font-medium">Account Temporarily Locked</div>
                <div>Time remaining: {formatTime(lockTime)}</div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || isLocked} 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/80 dark:bg-sidebar/80 px-3 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading || isLocked}
            variant="outline"
            className="w-full h-11 border-border/50 bg-background/50 hover:bg-accent hover:text-accent-foreground font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </Button>

          {/* Security Info */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Secure login for S&S Logistics
            </p>
            {attempts > 0 && !isLocked && (
              <p className="text-xs text-amber-600">
                {MAX_ATTEMPTS - attempts} login attempts remaining
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
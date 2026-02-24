'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import loginImg from './images/login.png';
import { authApi, ApiError } from '../../lib/api';

export default function SignupPage(): JSX.Element {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.signup({ name, email, password });

      if (response.success) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/quiz');
        }, 1000);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          setError(err.errors.join(', '));
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleSignup() {
    try {
      authApi.googleLogin('/quiz');
    } catch (err) {
      setError('Failed to initiate Google signup');
    }
  }

  return (
    <div className="bg-[#F6F3EE] h-screen overflow-hidden flex flex-col lg:flex-row">
      {/* ===== LEFT SIDE - Signup Form ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 md:px-16 py-6 sm:py-8 lg:py-0">
        <div className="w-full max-w-[380px]">
          {/* Heading */}
          <h1
            className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#0C1421] mb-2"
            style={{ fontFamily: "'SF Pro Rounded', -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            Create a new Account
          </h1>

          {/* Subtitle */}
          <p
            className="text-sm text-[#313957] leading-relaxed mb-5"
            style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            Discover books that match your mood and
            <br />
            reading style.
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#0C1421] mb-1"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full h-10 rounded-lg border border-[#D4D7E3] bg-[#F7FBFF] px-4 text-sm text-[#0C1421] placeholder:text-[#8897AD] focus:outline-none focus:ring-2 focus:ring-[#5C2F1E] focus:border-transparent transition-all"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#0C1421] mb-1"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Example@email.com"
                required
                className="w-full h-10 rounded-lg border border-[#D4D7E3] bg-[#F7FBFF] px-4 text-sm text-[#0C1421] placeholder:text-[#8897AD] focus:outline-none focus:ring-2 focus:ring-[#5C2F1E] focus:border-transparent transition-all"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#0C1421] mb-1"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full h-10 rounded-lg border border-[#D4D7E3] bg-[#F7FBFF] px-4 text-sm text-[#0C1421] placeholder:text-[#8897AD] focus:outline-none focus:ring-2 focus:ring-[#5C2F1E] focus:border-transparent transition-all"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#0C1421] mb-1"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                minLength={8}
                className="w-full h-10 rounded-lg border border-[#D4D7E3] bg-[#F7FBFF] px-4 text-sm text-[#0C1421] placeholder:text-[#8897AD] focus:outline-none focus:ring-2 focus:ring-[#5C2F1E] focus:border-transparent transition-all"
                style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
              />
            </div>

            {/* Error / Success - Only custom errors shown */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2.5">
                {success}
              </p>
            )}

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#5C2F1E] text-white rounded-lg text-sm font-semibold hover:bg-[#4a2517] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            {/* Terms Text */}
            <p
              className="text-xs text-center text-[#60351B] leading-relaxed"
              style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              By creating an account, you agree to our{' '}
              <a href="/terms" className="font-semibold hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="font-semibold hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#CFDFE2]" />
              <span className="text-xs text-[#294957]">Or</span>
              <div className="flex-1 h-px bg-[#CFDFE2]" />
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full h-10 flex items-center justify-center gap-3 rounded-lg border border-[#D4D7E3] bg-[#F7FBFF] text-sm font-medium text-[#0C1421] hover:bg-[#eef4fa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              <svg width="20" height="20" viewBox="0 0 533.5 544.3" aria-hidden="true">
                <path fill="#4285F4" d="M533.5 278.4c0-17.7-1.6-35-4.7-51.6H272v97.7h147.1c-6.4 34.9-26.1 64.4-55.7 84.2v69h89.8c52.5-48.3 82.3-119.7 82.3-199.3z" />
                <path fill="#34A853" d="M272 544.3c73.5 0 135.3-24.6 180.4-66.9l-89.8-69c-25 17.1-56.7 27.3-90.6 27.3-69.6 0-128.6-46.9-149.6-110.2h-93v69.4C78.5 486.2 168.8 544.3 272 544.3z" />
                <path fill="#FBBC05" d="M122.4 327.6c-10.9-32.8-10.9-68 0-100.8V157.4h-93c-38.5 75.6-38.5 165.5 0 241.1l93-70.9z" />
                <path fill="#EA4335" d="M272 107.7c38.9-.6 76.1 14.2 104.4 40.9l78.3-78.3C407 24.6 345.2 0 272 0 168.8 0 78.5 58.1 29.4 142.6l93 70.9C143.4 154.6 202.4 107.7 272 107.7z" />
              </svg>
              Sign in with Google
            </button>
          </form>

          {/* Sign In Link */}
          <p
            className="mt-5 text-center text-sm text-[#313957]"
            style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-[#5C2F1E] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* ===== RIGHT SIDE - Image Card (Desktop Only) ===== */}
      <div className="hidden lg:flex w-1/2 items-center justify-end px-3 py-2 xl:px-3 xl:py-2">
        <div className="relative w-full h-full max-w-[660px] max-h-[740px] rounded-[32px] overflow-hidden">
          <Image
            src={loginImg}
            alt="Login illustration"
            fill
            className="object-cover"
            priority
            sizes="(min-width: 1024px) 50vw, 0vw"
          />
        </div>
      </div>
    </div>
  );
}

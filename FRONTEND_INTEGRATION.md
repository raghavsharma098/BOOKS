# Frontend-Backend Integration Guide

## ✅ What's Been Implemented

### 1. **API Service Layer** (`lib/api.ts`)
- Complete authentication API wrapper
- Token management (localStorage)
- JWT access & refresh token handling
- Error handling with custom ApiError class
- Automatic Authorization header injection
- Google OAuth integration

### 2. **Login Page** (`app/login/login.tsx`)
- ✅ Fully functional email/password login
- ✅ Real-time validation
- ✅ Backend API integration
- ✅ Loading states
- ✅ Error handling with user feedback
- ✅ Success messages
- ✅ Google OAuth button (redirects to backend)
- ✅ Automatic redirect to `/quiz` on success
- ✅ Bottom padding added for better UX

### 3. **Signup Page** (`app/signup/signup.tsx`)
- ✅ Fully functional registration
- ✅ Backend API integration
- ✅ Password confirmation validation
- ✅ Loading states
- ✅ Error handling
- ✅ Google OAuth button
- ✅ Automatic redirect to `/quiz` on success
- ✅ Bottom padding added

### 4. **Environment Configuration**
- `.env.local` - Backend API URL configuration
- `.env.example` - Template for other developers

## 🚀 How to Test

### Step 1: Start the Backend
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

### Step 2: Start the Frontend
```bash
cd ..
npm run dev
# Frontend runs on http://localhost:3000
```

### Step 3: Test User Registration
1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Create account"
4. Should see success message and redirect to quiz

### Step 4: Test User Login
1. Go to `http://localhost:3000/login`
2. Use credentials from signup
3. Click "Sign in"
4. Should see success message and redirect to quiz

## 📦 Token Storage

Tokens are stored in localStorage:
- `accessToken` - JWT access token (15min expiry)
- `refreshToken` - Refresh token (7 days expiry)
- `user` - User details (JSON stringified)

## 🔧 API Endpoints Used

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/google` - Google OAuth login

## 🛡️ Security Features

1. **JWT Authentication**
   - Access tokens with short expiry (15 minutes)
   - Refresh tokens for extended sessions (7 days)
   - Automatic token refresh when expired

2. **Secure Headers**
   - CORS configured for frontend domain
   - Credentials enabled for cookie support
   - Helmet.js security headers in backend

3. **Input Validation**
   - Frontend validation (email format, password length)
   - Backend validation (express-validator)
   - Password hashing (bcrypt)

4. **Error Handling**
   - User-friendly error messages
   - Detailed error logging
   - API error class for consistent error handling

## 📱 User Flow

### New User Registration
```
Homepage → Sign Up Button → Signup Page → Fill Form → 
Submit → Backend Creates Account → Store Tokens → 
Redirect to Quiz → Complete Onboarding
```

### Existing User Login
```
Homepage → Sign In Button → Login Page → Enter Credentials → 
Submit → Backend Validates → Store Tokens → 
Redirect to Quiz (or Dashboard)
```

### Google OAuth
```
Login/Signup Page → Click "Sign in with Google" → 
Backend Google OAuth Flow → Google Authorization → 
Backend Creates/Updates User → Redirect with Tokens → 
Store Tokens → Redirect to Quiz
```

## 🔄 Token Refresh Flow

When an API call fails with 401 Unauthorized:
1. Frontend automatically calls `/api/auth/refresh` with refresh token
2. Backend validates refresh token
3. Backend issues new access token
4. Frontend stores new access token
5. Frontend retries original API call

## 🎨 UI States

### Login/Signup Pages Include:
- ✅ Loading state (button shows "Signing in..." / "Creating account...")
- ✅ Disabled state (prevents multiple submissions)
- ✅ Error messages (red text below form)
- ✅ Success messages (green text before redirect)
- ✅ Form validation (real-time feedback)
- ✅ Hover states on buttons

## 🚧 Next Steps

### To Complete Frontend:
1. **Protected Routes** - Create HOC or middleware to protect authenticated routes
2. **Quiz Integration** - Connect quiz submission to backend API
3. **Dashboard** - Create user dashboard showing reading stats
4. **Book Browse** - List books from backend with filters
5. **Book Details** - Show individual book page with reviews
6. **User Profile** - Display and edit user profile
7. **Recommendations** - Show personalized book recommendations
8. **Logout** - Implement logout functionality

### Protected Route Example:
```tsx
// components/ProtectedRoute.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
```

### API Usage Example:
```tsx
// In any component
import { authApi, tokenManager } from '@/lib/api';

// Get current user
const user = tokenManager.getUser();

// Check if authenticated
const isLoggedIn = tokenManager.getAccessToken() !== null;

// Logout
await authApi.logout();
router.push('/login');
```

## 🐛 Troubleshooting

### "Failed to fetch" Error
- **Cause**: Backend not running or wrong URL
- **Solution**: Check backend is running on port 5000, verify NEXT_PUBLIC_API_URL in .env.local

### CORS Errors
- **Cause**: Backend CORS not allowing frontend domain
- **Solution**: Check FRONTEND_URL in backend/.env matches your frontend URL

### 401 Unauthorized
- **Cause**: Token expired or invalid
- **Solution**: Token should auto-refresh, if not, logout and login again

### Token Not Persisting
- **Cause**: localStorage disabled or clear on page refresh
- **Solution**: Check browser settings, use incognito if extensions blocking

## 📝 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookplatform
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:3000
# ... other vars from backend/.env.example
```

## ✨ Features Implemented

- ✅ User Registration
- ✅ User Login
- ✅ Email/Password Auth
- ✅ Google OAuth (backend ready, needs credentials)
- ✅ JWT Token Management
- ✅ Refresh Token System
- ✅ Token Storage
- ✅ Error Handling
- ✅ Loading States
- ✅ Form Validation
- ✅ Automatic Redirects
- ✅ Bottom padding on auth pages

## 📞 Support

For issues:
1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Verify environment variables are set
4. Ensure MongoDB is running
5. Check network tab for API call details

---

**Status**: 🎉 **Authentication System Complete** - Login and Signup pages are fully functional and integrated with the backend API!

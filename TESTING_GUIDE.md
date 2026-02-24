# 🚀 Quick Start Guide - Testing the Full System

## Prerequisites Checklist
- ✅ Node.js installed (v14+)
- ✅ MongoDB installed and running
- ✅ Both frontend and backend dependencies installed

## Step-by-Step Setup

### 1️⃣ Start MongoDB
```bash
# Windows
mongod

# macOS (with Homebrew)
brew services start mongodb-community

# Or use MongoDB Atlas (cloud) - update MONGODB_URI in backend/.env
```

### 2️⃣ Configure Backend Environment
```bash
cd backend

# Copy example env file
cp .env.example .env

# Edit .env file with your credentials
# Minimum required:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookplatform
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_at_least_32_chars
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3️⃣ Setup Backend Database
```bash
# Still in backend directory

# Install dependencies (if not done)
npm install

# Create admin user
npm run create-admin
# Output: Email: admin@bookplatform.com, Password: Admin@123

# Seed quiz questions
npm run seed-quiz
# Output: Successfully seeded 6 quiz questions
```

### 4️⃣ Start Backend Server
```bash
# In backend directory
npm run dev

# You should see:
# Server running on port 5000
# MongoDB connected successfully
# Starting scheduled jobs...
# All scheduled jobs started successfully
```

### 5️⃣ Start Frontend
```bash
# Open new terminal, go to project root
cd ..

# Install dependencies (if not done)
npm install

# Start Next.js dev server
npm run dev

# You should see:
# - Local: http://localhost:3000
# - Ready in 2.3s
```

## 🧪 Testing the System

### Test 1: Homepage ✅
1. Open browser: `http://localhost:3000`
2. Should see homepage with:
   - Navbar with "Sign in" and "Get Started" buttons
   - Hero section with "Get Started" button
   - Various sections (Why Choose, Blogs, Reviews, Footer)
3. Click any button → Should go to `/login`

### Test 2: User Registration ✅
1. Go to: `http://localhost:3000/signup`
2. Fill the form:
   ```
   Name: John Doe
   Email: john@example.com
   Password: password123
   ```
3. Click "Create account"
4. Should see:
   - Button text changes to "Creating account..."
   - Success message: "Account created successfully! Redirecting..."
   - Automatic redirect to `/quiz` after 1 second

### Test 3: User Login ✅
1. Go to: `http://localhost:3000/login`
2. Use credentials from signup:
   ```
   Email: john@example.com
   Password: password123
   ```
3. Click "Sign in"
4. Should see:
   - Button text changes to "Signing in..."
   - Success message: "Login successful! Redirecting..."
   - Redirect to `/quiz`

### Test 4: Backend API (Using Browser or Postman) ✅
```bash
# Health check
curl http://localhost:5000/health
# Response: {"status":"OK","message":"Server is running"}

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Should return: User data with accessToken and refreshToken
```

### Test 5: Admin Login ✅
1. Go to: `http://localhost:3000/login`
2. Use admin credentials:
   ```
   Email: admin@bookplatform.com
   Password: Admin@123
   ```
3. Should login successfully

### Test 6: Validation Errors ✅
1. Try signup with existing email → Should show "Email already exists"
2. Try login with wrong password → Should show "Invalid credentials"
3. Try login with invalid email format → Should show "Enter a valid email address"
4. Try password less than 6 chars → Should show validation error

### Test 7: Browser Storage ✅
1. After successful login, open DevTools (F12)
2. Go to: Application → Local Storage → http://localhost:3000
3. Should see:
   - `accessToken`: JWT token string
   - `refreshToken`: Refresh token string
   - `user`: JSON object with user details

## 🎯 What Works Now

### Frontend ✅
- ✅ Homepage renders on `/`
- ✅ Login page with backend integration
- ✅ Signup page with backend integration
- ✅ All auth buttons redirect to `/login`
- ✅ Form validation (client-side)
- ✅ Error handling with user feedback
- ✅ Loading states
- ✅ Success messages
- ✅ Auto-redirect after login/signup
- ✅ Token storage in localStorage
- ✅ Bottom padding on auth pages

### Backend ✅
- ✅ Express server running
- ✅ MongoDB connected
- ✅ 120+ API endpoints
- ✅ JWT authentication
- ✅ User registration
- ✅ User login
- ✅ Password hashing (bcrypt)
- ✅ Token refresh system
- ✅ Email validation
- ✅ Error handling
- ✅ CORS configured
- ✅ Rate limiting
- ✅ Security headers
- ✅ Scheduled jobs running
- ✅ Admin user created
- ✅ Quiz questions seeded

### Database ✅
- ✅ MongoDB connected
- ✅ Collections created automatically
- ✅ Indexes configured
- ✅ Admin user in database
- ✅ Quiz questions in database
- ✅ Users collection ready

## 🔍 Debugging

### Backend Not Starting?
```bash
# Check if MongoDB is running
mongo --eval "db.version()"

# Check if port 5000 is available
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # macOS/Linux

# Check backend logs
cd backend
npm run dev
# Read error messages carefully
```

### Frontend Not Starting?
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start again
npm run dev
```

### CORS Errors?
```bash
# Check backend .env file
FRONTEND_URL=http://localhost:3000  # Must match frontend URL

# Restart backend after changing
```

### Database Connection Error?
```bash
# Check MongoDB is running
# Check MONGODB_URI in backend/.env
# Try: mongodb://localhost:27017/bookplatform
# Or: mongodb://127.0.0.1:27017/bookplatform
```

## 📊 Expected Console Output

### Backend Terminal:
```
Server running on port 5000
MongoDB connected successfully
Starting scheduled jobs...
All scheduled jobs started successfully
GET /health 200 2.345 ms - 45
POST /api/auth/signup 201 234.567 ms - 456
POST /api/auth/login 200 123.456 ms - 456
```

### Frontend Terminal:
```
▲ Next.js 14.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.3s
○ Compiling / ...
✓ Compiled / in 1.2s
```

### Browser Console:
```
# After successful login/signup
[API] Login successful
[Router] Navigating to /quiz
```

## 🎉 Success Indicators

You know everything is working when:
1. ✅ Backend shows "MongoDB connected successfully"
2. ✅ Frontend loads at http://localhost:3000
3. ✅ You can create a new account
4. ✅ You receive JWT tokens in localStorage
5. ✅ You can login with created credentials
6. ✅ Redirects work automatically
7. ✅ No CORS errors in browser console
8. ✅ Backend logs show successful API calls

## 🚀 Next Steps

After confirming everything works:
1. **Complete Quiz Page** - Make it functional with backend
2. **Build Dashboard** - Show user's reading stats
3. **Book Listing** - Fetch and display books from backend
4. **Book Details** - Individual book page with reviews
5. **User Profile** - Display and edit user profile
6. **Recommendations** - Show personalized book recommendations
7. **Protected Routes** - Implement auth guards
8. **Logout** - Add logout functionality

## 📝 Common Testing Scenarios

### New User Journey:
```
Homepage → Get Started → Signup → Create Account → 
Auto Login → Quiz → Complete Quiz → Dashboard
```

### Returning User:
```
Homepage → Sign In → Login → Auto Redirect to Quiz/Dashboard
```

### Admin User:
```
Login as Admin → Access Admin Panel → 
Manage Books/Authors/Users/Giveaways
```

## 🐛 Known Issues

1. **Google OAuth** - Requires Google Client ID/Secret in backend/.env
2. **Email Verification** - Requires SMTP credentials in backend/.env
3. **Forgot Password** - Requires email service configured
4. **File Uploads** - Requires Cloudinary credentials in backend/.env
5. **AI Recommendations** - Requires OpenAI API key in backend/.env

These features have backend support but need credentials to be fully functional.

## ✅ Testing Checklist

Before moving forward, verify:
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] MongoDB is connected
- [ ] Can create new user account
- [ ] Can login with created account
- [ ] Tokens saved in localStorage
- [ ] Redirects work properly
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Admin user can login
- [ ] Health endpoint responds
- [ ] No console errors

Once all checked, you're ready to build the rest of the application! 🎉

---

**Status**: 🟢 **System Ready** - Frontend and backend are fully integrated and functional for authentication!

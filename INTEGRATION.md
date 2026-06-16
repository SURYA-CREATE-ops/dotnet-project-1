# 🔗 JobFlow Frontend-Backend Integration Guide

## ✅ Integration Complete

The frontend is now fully connected to the backend API with authentication, JWT token management, and protected routes.

---

## 🏗️ Architecture Overview

```
Frontend (React + TypeScript)
    ↓
Axios HTTP Client
    ↓ (with JWT interceptors)
Backend API (ASP.NET Core)
    ↓
SQLite Database
```

---

## 🔑 Key Features Implemented

### 1. **Authentication Service** (`frontend/src/services/authService.ts`)
- `register()` - Create new user account
- `login()` - Authenticate and receive JWT token
- `logout()` - Clear authentication data
- `getToken()` - Retrieve stored JWT token
- `getUser()` - Get logged-in user info
- `isAuthenticated()` - Check auth status

### 2. **API Service with Interceptors** (`frontend/src/services/api.ts`)
- **Request Interceptor:** Automatically adds JWT token to all requests
- **Response Interceptor:** Handles 401 errors by redirecting to login

### 3. **Protected Routes** (`frontend/src/routes/ProtectedRoute.tsx`)
- Guards dashboard from unauthenticated access
- Redirects to login if no valid JWT token
- Works seamlessly with React Router v6

### 4. **Authentication Pages**

#### Login Page (`frontend/src/pages/Login.tsx`)
- Email and password input
- Form validation
- Error message display
- Loading state
- Successful login redirects to dashboard
- Link to registration page

#### Register Page (`frontend/src/pages/Register.tsx`)
- Name, email, and password input
- Form validation
- Error message display
- Loading state
- Successful registration redirects to login
- Link to login page

### 5. **Dashboard** (`frontend/src/pages/Dashboard.tsx`)
- Shows welcome message
- Displays logged-in user name and email
- Logout button
- Protected route (requires authentication)

### 6. **Navbar** (`frontend/src/components/Navbar.tsx`)
- Conditional display based on authentication status
- Shows user name when logged in
- Logout button for authenticated users
- Login/Register buttons for unauthenticated users

---

## 📡 Data Flow

### Registration Flow
```
1. User fills registration form (name, email, password)
2. Form submits to POST /api/auth/register
3. Backend creates user in SQLite database
4. Frontend redirects to login page
```

### Login Flow
```
1. User fills login form (email, password)
2. Form submits to POST /api/auth/login
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. Frontend stores user data in localStorage
6. Frontend redirects to dashboard
```

### Protected Route Access
```
1. User navigates to /dashboard
2. ProtectedRoute checks isAuthenticated()
3. If authenticated: render Dashboard
4. If not authenticated: redirect to /login
```

### API Request with JWT
```
1. Frontend makes API request
2. Request interceptor adds: Authorization: Bearer {token}
3. Backend receives request with JWT
4. Backend validates token
5. Backend processes request and returns response
```

### Logout Flow
```
1. User clicks logout button
2. Frontend calls authService.logout()
3. Frontend clears localStorage
4. Frontend redirects to /login
```

---

## 💾 Storage

### localStorage Keys
- `jobflow_token` - JWT token
- `jobflow_user` - User object (id, name, email, createdAt)

### Persistence
- Tokens persist across browser refresh
- User data persists across sessions
- Automatic clearing on logout or 401 response

---

## 🚀 Testing the Integration

### Prerequisites
Both servers must be running:
```bash
# Terminal 1 - Backend
./start-backend.sh

# Terminal 2 - Frontend
./start-frontend.sh
```

### Test 1: User Registration
```
1. Open http://localhost:5173
2. Click "Register" button
3. Fill in: Name, Email, Password
4. Click "Register"
5. ✓ Should redirect to login page
6. Check backend: Verify user created in SQLite
```

### Test 2: User Login
```
1. On login page, enter credentials from registration
2. Click "Login"
3. ✓ Should redirect to dashboard
4. ✓ Navbar should show user name and "Logout" button
5. ✓ Dashboard should display welcome message with user info
```

### Test 3: Protected Route
```
1. Logout and clear localStorage
2. Try to access http://localhost:5173/dashboard directly
3. ✓ Should redirect to login page
4. This confirms ProtectedRoute is working
```

### Test 4: Token Persistence
```
1. Login successfully
2. Refresh the page (Ctrl+R)
3. ✓ Should stay on dashboard
4. ✓ User info should still display
5. This confirms localStorage persistence works
```

### Test 5: Logout
```
1. On dashboard, click "Logout" button
2. ✓ Should redirect to login page
3. ✓ Navbar should show "Login" and "Register" buttons
4. ✓ localStorage should be cleared
```

### Test 6: Unauthorized Request
```
1. Open browser DevTools Console
2. Clear localStorage: localStorage.clear()
3. Try to access dashboard
4. ✓ Should redirect to login page
5. This confirms API response handler works
```

---

## 🔐 Security Features

✅ **JWT Token Storage** - Tokens stored in localStorage with Bearer scheme  
✅ **Token in Headers** - Automatically included in all API requests  
✅ **Unauthorized Handling** - 401 responses trigger logout and redirect  
✅ **Protected Routes** - Dashboard requires valid authentication  
✅ **Form Validation** - Email and password fields validated  
✅ **Loading States** - Forms disabled during submission  

---

## 📋 API Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/api/auth/register` | POST | Create new account | No |
| `/api/auth/login` | POST | Login and get JWT | No |
| `/api/health` | GET | Health check | No |

**Request Bodies:**

Register:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Login:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

Login Success:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🛠️ Files Modified

### New Files Created
- `frontend/src/services/authService.ts` - Authentication service
- `frontend/src/routes/ProtectedRoute.tsx` - Protected route component

### Files Updated
- `frontend/src/services/api.ts` - Added JWT interceptors
- `frontend/src/pages/Login.tsx` - Added form logic and API integration
- `frontend/src/pages/Register.tsx` - Added form logic and API integration
- `frontend/src/pages/Dashboard.tsx` - Added user display and logout
- `frontend/src/routes/AppRoutes.tsx` - Added ProtectedRoute wrapper
- `frontend/src/components/Navbar.tsx` - Added conditional auth display

---

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5220/api
```

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=JobFlow.db"
  },
  "JwtSettings": {
    "SecretKey": "V3ryStr0ngJWTSecretKeyForJobFlow123!",
    "Issuer": "JobFlowApi",
    "Audience": "JobFlowApiUsers"
  }
}
```

---

## 🎯 Next Steps

The frontend and backend are now fully integrated. You can:

1. **Test the complete auth flow** - Register, login, logout
2. **Add more API endpoints** - Create, read, update, delete jobs
3. **Implement job management UI** - List, create, and manage jobs
4. **Add real-time updates** - WebSocket or polling for job status
5. **Deploy to production** - Build and deploy both frontend and backend

---

## ✨ Verification Checklist

- ✅ Backend running on http://localhost:5220
- ✅ Frontend running on http://localhost:5173
- ✅ SQLite database operational with auto-schema creation
- ✅ User registration functional
- ✅ User login with JWT generation
- ✅ Protected routes redirecting unauthenticated users
- ✅ JWT token included in API requests
- ✅ Logout clearing all auth data
- ✅ Navbar showing conditional auth status
- ✅ Dashboard displaying user information
- ✅ Frontend dev server with hot-reload working
- ✅ Error handling and loading states in UI

All systems operational! 🚀

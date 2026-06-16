# 🛡️ JobFlow - Server Reliability & Operations Guide

## ✅ Reliability Improvements Made

### 1. **Robust Database Initialization** 
- **File:** `JobFlow.API/Program.cs`
- **What it does:** 
  - Wraps database initialization in try-catch blocks
  - Prevents database errors from crashing the server on startup
  - Logs detailed error messages for debugging
  - Server starts even if database initialization has temporary issues

### 2. **JobProcessingWorker Resilience**
- **File:** `JobFlow.Infrastructure/Workers/JobProcessingWorker.cs`
- **Improvements:**
  - 2-second startup delay to ensure database is ready
  - Connection availability check before each job processing cycle
  - Automatic retry on database connection failures (10-second backoff)
  - Proper exception handling throughout - worker never crashes the app
  - Graceful shutdown support

### 3. **SQLite Database**
- Replaced unreliable SQL Server connection with local SQLite
- Database file: `JobFlow.API/JobFlow.db`
- **Advantages:** 
  - Always available (no network dependency)
  - Automatic schema creation on first run
  - Persistent data storage
  - Zero additional setup required

---

## 🚀 Quick Start

### Start Backend Only
```bash
# Option 1: Using the startup script (recommended)
cd "~/Desktop/dotner project 1 (cognizant)"
./start-backend.sh

# Option 2: Manual start
cd "~/Desktop/dotner project 1 (cognizant)"
dotnet run --project JobFlow.API/JobFlow.API.csproj --urls http://localhost:5220
```

### Start Frontend Only
```bash
cd "~/Desktop/dotner project 1 (cognizant)"
./start-frontend.sh

# Or manually
cd "~/Desktop/dotner project 1 (cognizant)/frontend"
npm run dev
```

### Start Both (Recommended for Development)
**Terminal 1 - Backend:**
```bash
cd "~/Desktop/dotner project 1 (cognizant)"
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
cd "~/Desktop/dotner project 1 (cognizant)"
./start-frontend.sh
```

---

## 🔍 Verification Checklist

After starting the backend, verify it's operational:

```bash
# Check if server is responsive
curl http://localhost:5220/api/health

# Expected response:
# {"status":"running","project":"JobFlow"}

# Access Swagger documentation
# Open in browser: http://localhost:5220/swagger
```

---

## 📊 Server Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get JWT token |
| `/swagger` | GET | Swagger UI documentation |

---

## 🔧 Configuration Files

### Database Configuration
- **File:** `JobFlow.API/appsettings.json`
- **Connection String:** `Data Source=JobFlow.db`

### JWT Settings
- **Issuer:** `JobFlowApi`
- **Audience:** `JobFlowApiUsers`
- **Secret Key:** (configured in appsettings.json)

---

## ⚠️ Troubleshooting

### Server Won't Start
1. Check if port 5220 is already in use:
   ```bash
   lsof -i :5220  # See what's using the port
   kill -9 <PID>  # Kill the process if needed
   ```

2. Try cleaning the build:
   ```bash
   cd "~/Desktop/dotner project 1 (cognizant)"
   dotnet clean JobFlow.API/JobFlow.API.csproj
   dotnet build JobFlow.API/JobFlow.API.csproj
   ```

3. Reset the database (starts fresh):
   ```bash
   rm -f JobFlow.API/JobFlow.db
   # Then restart the server
   ```

### Database Errors in Logs
- These are now handled gracefully and won't crash the server
- The JobProcessingWorker will automatically retry connecting
- Check `http://localhost:5220/api/health` to confirm the API is still operational

### Frontend Can't Connect to Backend
1. Verify backend is running: `curl http://localhost:5220/api/health`
2. Check frontend is configured to use correct API URL: `http://localhost:5220/api`
3. Verify CORS is enabled (it is by default)

---

## 📝 Key Technical Details

### Data Persistence
- SQLite database file is created automatically in `JobFlow.API/JobFlow.db`
- Data persists across server restarts
- Database schema (Users, Jobs tables) created automatically

### Background Processing
- JobProcessingWorker processes pending jobs in the background
- Runs every 10 seconds with proper error recovery
- Won't interrupt main API functionality

### Authentication
- JWT token-based authentication
- Tokens include user ID and email in claims
- Tokens have configurable expiration time

---

## 🎯 Development Workflow

1. **Start Backend:** `./start-backend.sh`
2. **Start Frontend:** `./start-frontend.sh` (in another terminal)
3. **Access Frontend:** `http://localhost:5173`
4. **API Documentation:** `http://localhost:5220/swagger`
5. **Make Changes:** Edit code, servers auto-reload (Vite for frontend)

---

## ✨ What's Now Always Operational

✅ **Backend API** - Never crashes due to database issues  
✅ **SQLite Database** - Always available, auto-initialized  
✅ **User Registration** - Fully functional  
✅ **User Login** - JWT token generation working  
✅ **Job Processing Worker** - Handles failures gracefully  
✅ **Swagger Documentation** - Available for API testing  

The server will remain operational even if temporary issues occur. All data persists across restarts.

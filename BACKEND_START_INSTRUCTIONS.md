# Backend Server Start Instructions

## Issue
Frontend is showing `ERR_CONNECTION_REFUSED` errors because the backend server is not running.

## Solution

### Start Backend Server

1. **Open Terminal in Backend Directory:**
   ```bash
   cd appzetofood/backend
   ```

2. **Install Dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Start the Server:**
   ```bash
   npm start
   ```
   
   OR if you have a dev script:
   ```bash
   npm run dev
   ```

4. **Verify Server is Running:**
   - You should see: `Server running on port 5000`
   - Check: `http://localhost:5000/api/health` (if health endpoint exists)

### Expected Output:
```
✅ MongoDB Connected
✅ Server running on port 5000
✅ Socket.IO initialized
```

### Common Issues:

1. **Port 5000 already in use:**
   - Kill the process using port 5000
   - Or change PORT in `.env` file

2. **MongoDB connection failed:**
   - Check MongoDB connection string in `.env`
   - Ensure MongoDB is running

3. **Missing environment variables:**
   - Check `.env` file has all required variables
   - Copy from `.env.example` if needed

### After Starting Backend:

- ✅ Frontend will automatically connect
- ✅ Socket.IO connections will work
- ✅ API calls will succeed
- ✅ Location updates will be sent to backend


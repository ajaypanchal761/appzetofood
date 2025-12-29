# Google Sign-In Complete Flow Documentation

## Complete Authentication Flow

### 1. Frontend (User Clicks Google Button)
- User clicks Google sign-in button
- `handleGoogleSignIn()` function called
- Firebase `signInWithRedirect()` called
- User redirected to Google OAuth page

### 2. Google OAuth
- User selects Google account (`panchalajay717@gmail.com`)
- User grants permissions
- Google redirects back to app with auth code

### 3. Frontend (Redirect Handler)
- `useEffect` hook detects redirect result
- `getRedirectResult()` called
- Firebase user object obtained
- ID token extracted: `user.getIdToken()`

### 4. Backend API Call
- Frontend calls: `authAPI.firebaseGoogleLogin(idToken, "user")`
- Endpoint: `POST /api/auth/firebase/google-login`
- Payload: `{ idToken: "...", role: "user" }`

### 5. Backend Processing
1. **Firebase Token Verification**
   - `firebaseAuthService.verifyIdToken(idToken)` called
   - Firebase Admin SDK verifies token
   - Decoded token contains: uid, email, name, picture, email_verified

2. **User Lookup/Creation**
   - Search for existing user by:
     - `googleId` (Firebase UID)
     - `email` + `role: "user"`
   - If user exists:
     - Link Google ID if not already linked
     - Update profile image if missing
     - Set signupMethod to 'google'
   - If user doesn't exist:
     - Create new user with:
       - name, email, googleId, googleEmail
       - role: "user"
       - signupMethod: "google"
       - profileImage (from Google)
       - isActive: true

3. **JWT Token Generation**
   - Generate access token (24h expiry)
   - Generate refresh token (7d expiry)
   - Tokens contain: userId, role, email

4. **Response**
   - Return accessToken and user data
   - Set refreshToken in httpOnly cookie

### 6. Frontend (Save & Redirect)
- Save accessToken to localStorage: `user_accessToken`
- Save user data to localStorage: `user_user`
- Set authenticated flag: `user_authenticated = 'true'`
- Dispatch event: `userAuthChanged`
- Navigate to `/user` dashboard

## Database Schema

User document structure:
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (lowercase, trimmed),
  googleId: String (unique, sparse),
  googleEmail: String,
  role: String (enum: 'user', 'restaurant', 'delivery', 'admin'),
  signupMethod: String (enum: 'google', 'phone', 'email'),
  profileImage: String (Google profile picture),
  isActive: Boolean (default: true),
  phone: String (optional),
  phoneVerified: Boolean (default: false),
  // ... other fields
  createdAt: Date,
  updatedAt: Date
}
```

## Validation & Security

### Frontend Validation
- ✅ Firebase configuration validated
- ✅ Auth instance validated before use
- ✅ Error handling for all cases
- ✅ User data validation before save

### Backend Validation
- ✅ Firebase ID token verification
- ✅ Email presence and format validation
- ✅ Role validation (only 'user', 'restaurant', 'delivery' allowed)
- ✅ User active status check
- ✅ Duplicate user handling
- ✅ Database transaction safety

### Authorization
- ✅ JWT token-based authentication
- ✅ Role-based access control
- ✅ Token expiry handling
- ✅ Refresh token mechanism
- ✅ httpOnly cookies for refresh tokens

## Error Handling

### Common Errors & Solutions

1. **auth/configuration-not-found**
   - **Cause**: Domain not authorized in Firebase Console
   - **Solution**: Add `localhost` to Firebase Console > Authentication > Settings > Authorized domains

2. **500 Server Error**
   - **Cause**: Firebase Admin SDK not configured
   - **Solution**: Check backend `.env` or `firebaseconfig.json` has correct credentials

3. **Invalid response from server**
   - **Cause**: Backend didn't return accessToken or user data
   - **Solution**: Check backend logs, verify database connection

4. **User not found after creation**
   - **Cause**: Database save failed or duplicate key error
   - **Solution**: Check MongoDB connection, verify indexes

## Testing Checklist

- [ ] Firebase Console: `localhost` in authorized domains
- [ ] Firebase Console: Google Sign-In method enabled
- [ ] Backend: Firebase Admin SDK configured
- [ ] Backend: MongoDB connected
- [ ] Backend: JWT_SECRET set in .env
- [ ] Frontend: .env file has Firebase config
- [ ] Test: Google button click works
- [ ] Test: Google OAuth page opens
- [ ] Test: Account selection works
- [ ] Test: Redirect back to app works
- [ ] Test: User created in database
- [ ] Test: Access token saved to localStorage
- [ ] Test: User redirected to /user dashboard
- [ ] Test: User can access protected routes

## Debugging Steps

1. **Check Browser Console**
   - Look for Firebase initialization messages
   - Check for any errors in sign-in flow
   - Verify token and user data in logs

2. **Check Backend Logs**
   - Firebase Admin initialization
   - Token verification success
   - User creation/login logs
   - Any error messages

3. **Check Database**
   - Verify user document created
   - Check user fields are correct
   - Verify googleId and email are set

4. **Check localStorage**
   - `user_accessToken` should exist
   - `user_user` should contain user data
   - `user_authenticated` should be 'true'

## Current Configuration

- **Project ID**: zomato-607fa
- **Web Client ID**: 1065631021082-22k5mp7j272kieut8j28naicb7njf96j.apps.googleusercontent.com
- **Support Email**: lovelysingh8966@gmail.com
- **Default Role for Sign-In**: "user"


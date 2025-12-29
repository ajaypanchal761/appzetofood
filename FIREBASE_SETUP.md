# Firebase Setup Instructions

## Error: auth/configuration-not-found

यह error तब आता है जब Firebase Console में आपका domain authorized नहीं है।

## Solution: Firebase Console में Domain Add करें

### Step 1: Firebase Console खोलें
1. https://console.firebase.google.com/ पर जाएं
2. अपना project select करें: **zomato-607fa**

### Step 2: Authentication Settings
1. Left sidebar में **Authentication** click करें
2. **Settings** tab पर जाएं
3. **Authorized domains** section में scroll करें

### Step 3: Domain Add करें
**Authorized domains** list में ये domains add करें:

#### Local Development:
- `localhost`
- `127.0.0.1`
- `localhost:5173` (अगर Vite port 5173 use कर रहे हैं)

#### Production:
- आपका actual domain (जैसे: `yourapp.com`)
- `yourapp.com` (without www)
- `www.yourapp.com` (with www)

### Step 4: OAuth Redirect URIs (Google Cloud Console)
1. Google Cloud Console खोलें: https://console.cloud.google.com/
2. Project select करें: **zomato-607fa**
3. **APIs & Services** > **Credentials** पर जाएं
4. **OAuth 2.0 Client IDs** में Web client (1065631021082-22k5mp7j272kieut8j28naicb7njf96j) click करें
5. **Authorized redirect URIs** में add करें:
   - `http://localhost:5173` (local development)
   - `http://localhost:5173/__/auth/handler` (Firebase redirect handler)
   - `https://zomato-607fa.firebaseapp.com/__/auth/handler` (Firebase default)
   - आपका production URL (अगर है)
6. **Save** करें

### Step 5: Save और Test
1. सभी changes save करें
2. Browser में hard refresh करें (Ctrl+Shift+R)
3. Google sign-in फिर से try करें

## Current Configuration

- **Project ID**: zomato-607fa
- **Project Number**: 1065631021082
- **Auth Domain**: zomato-607fa.firebaseapp.com
- **API Key**: AIzaSyC_TqpDR7LNHxFEPd8cGjl_ka_Rj0ebECA
- **Web Client ID**: 1065631021082-22k5mp7j272kieut8j28naicb7njf96j.apps.googleusercontent.com
- **Support Email**: lovelysingh8966@gmail.com
- **Public-facing Name**: project-1065631021082

## Important Notes

1. **Authorized domains** में domain add करने के बाद changes apply होने में कुछ minutes लग सकते हैं
2. Local development के लिए `localhost` हमेशा authorized होता है, लेकिन port number के साथ explicitly add करना better है
3. Production में actual domain add करना जरूरी है

## Verification

Console में check करें:
- "Current origin: http://localhost:5173" (या आपका domain)
- "Current hostname: localhost" (या आपका hostname)

अगर ये values Firebase Console में authorized domains list में नहीं हैं, तो error आएगा।


# Google sign-in setup

ShopEasy uses the Google authorization code flow with PKCE. The Express backend exchanges the code, validates Google's ID token, links or creates a MongoDB user, and issues the same seven-day app JWT used by password sign-in in an HttpOnly cookie. The browser never receives the JWT in JSON, a URL, or localStorage.

## Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Go to **Google Auth Platform** (or **APIs & Services → OAuth consent screen**) and configure the consent screen. Select the audience appropriate for the app, add the app name and support contact, and add the `openid`, `email`, and `profile` scopes. During testing, add your Google accounts as test users if the app is in testing mode.
3. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**. Choose **Web application**.
4. Add these authorized JavaScript origins for local development:
   - `http://localhost:5173`
5. Add this authorized redirect URI for local development:
   - `http://localhost:5000/auth/google/callback`
6. For production, add the frontend origin (for example `https://shop.example.com`) and the exact backend callback URI (for example `https://api.example.com/auth/google/callback`). Set the same production callback in `GOOGLE_REDIRECT_URI`.
7. Copy the OAuth client ID and client secret into the backend environment. Keep the secret private; do not put it in a `VITE_` variable or frontend bundle.

## Environment variables

Copy `.env.example` to the repository root as `.env` for local development. The backend also loads `backend/.env` first, so you can keep server-only values there instead. `.env` files are ignored by Git; commit only the example file with placeholders.

Set the following values:

| Variable | Purpose | Local value/example |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Server-only Google client secret | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | Exact backend callback registered in Google | `http://localhost:5000/auth/google/callback` |
| `FRONTEND_URL` | Frontend origin used for post-auth redirects | `http://localhost:5173` |
| `CLIENT_ORIGIN` | Comma-separated allowed browser origins | `http://localhost:5173` |
| `JWT_SECRET` | Signs the ShopEasy session and short-lived OAuth state | A long random secret |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/ecommerce` |
| `VITE_API_BASE_URL` | Frontend's backend origin | `http://localhost:5000` |
| `NODE_ENV` | Controls Secure cookie behavior | `development` locally; `production` on HTTPS |

Use HTTPS and `NODE_ENV=production` in production. The session cookie is `HttpOnly`, `Secure`, `SameSite=None` in production so credentialed requests from the Vercel frontend can send it to Render; local development uses `SameSite=Lax` without `Secure`. Set Render's `FRONTEND_URL` and `CLIENT_ORIGIN` to `https://e-commerce-lac-beta-32.vercel.app`, and set `GOOGLE_REDIRECT_URI` to `https://e-commerce-ziyi.onrender.com/auth/google/callback`. Rebuild the frontend after changing `VITE_API_BASE_URL`.

### Render backend service

For the Render web service that hosts the API, set **Root Directory** to the repository root, **Build Command** to `npm install`, and **Start Command** to `npm run server`. That script starts the root `server.js`, which imports `backend/server.js` and mounts the OAuth router at `/auth`. Deploy the commit containing `backend/server.js` and `backend/src/routes/googleAuthRoutes.js`; a stale deployment or a different Express entry point will return Express's `Cannot GET /auth/google` response even though the route exists in this source tree.

## Run locally

1. Install dependencies with `npm install` and make sure MongoDB is running.
2. Copy `.env.example` to `.env`, set a long random `JWT_SECRET`, and paste the Google client credentials into the three `GOOGLE_*` variables.
3. Start both apps with `npm run dev:full` (Vite at `http://localhost:5173`, Express at `http://localhost:5000`). Or run `npm run server` and `npm run dev` in separate terminals.
4. Open `/login` or `/signup`, then choose **Continue with Google**. Both tabs call `GET http://localhost:5000/auth/google` and return to the requested same-origin path after successful sign-in.
5. Check that the navbar shows the user's name/avatar. Select Logout and verify that protected pages request sign-in again.

## Manual test checklist

- [ ] New Google account creates a user with `googleId`, `provider: "google"`, `emailVerified: true`, avatar, and no password; the browser receives an HttpOnly session cookie.
- [ ] Returning Google account signs in to the same user.
- [ ] Existing password account with the same verified email gains its `googleId` and can still use password sign-in.
- [ ] A Google-only account entering password sign-in sees a message to use Google or set a password.
- [ ] Cancelling Google consent redirects to `/login?error=google_denied` with a friendly message.
- [ ] Editing the callback `state` or removing the OAuth state cookie redirects to `/login?error=invalid_state` and does not create a session.
- [ ] An unverified Google email is rejected with a friendly message and no session.
- [ ] A `redirect` value such as `https://attacker.example` or `//attacker.example` falls back to `/profile`.
- [ ] `POST /api/auth/logout` (or `/auth/logout`) clears the session cookie, and `GET /api/auth/me` no longer authenticates afterward.

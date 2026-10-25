import express from 'express';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { clearSessionCookie, setSessionCookie } from '../utils/authSession.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const OAUTH_COOKIE = 'shopeasy_google_oauth';
const OAUTH_COOKIE_PATH = '/auth/google';
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const oauthLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: 'draft-7', legacyHeaders: false });

router.get('/me', protect, (req, res) => res.json({ user: req.user }));
router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ message: 'Logged out' });
});

const oauthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: OAUTH_COOKIE_PATH,
  maxAge: OAUTH_STATE_TTL_MS,
});

const clearOAuthCookie = (res) => {
  const { maxAge, ...options } = oauthCookieOptions();
  res.clearCookie(OAUTH_COOKIE, options);
};

const config = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, FRONTEND_URL, JWT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !FRONTEND_URL || !JWT_SECRET) {
    throw new Error('Google sign-in is not configured');
  }
  return { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, redirectUri: GOOGLE_REDIRECT_URI, frontendUrl: new URL(FRONTEND_URL).origin, jwtSecret: JWT_SECRET };
};

const createOAuthClient = ({ clientId, clientSecret, redirectUri }) => new OAuth2Client({
  clientId,
  clientSecret,
  redirectUri,
});

const safeRedirectPath = (candidate, frontendUrl) => {
  if (typeof candidate !== 'string' || !candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\') || /[\u0000-\u001f]/.test(candidate)) return '/profile';
  try {
    const parsed = new URL(candidate, frontendUrl);
    if (parsed.origin !== frontendUrl) return '/profile';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/profile';
  }
};

const redirectFailure = (res, frontendUrl, code) => {
  const target = new URL('/login', frontendUrl);
  target.searchParams.set('error', code);
  res.redirect(target.toString());
};

const validatedState = (req, jwtSecret) => {
  const signedState = req.cookies?.[OAUTH_COOKIE];
  if (!signedState) return null;
  try {
    return jwt.verify(signedState, jwtSecret, { audience: 'shopeasy-google-oauth' });
  } catch {
    return null;
  }
};

router.get('/google', oauthLimiter, async (req, res) => {
  let frontendUrl;
  try {
    const settings = config();
    frontendUrl = settings.frontendUrl;
    const oauthClient = createOAuthClient(settings);
    const { codeVerifier, codeChallenge } = await oauthClient.generateCodeVerifierAsync();
    const state = randomBytes(32).toString('base64url');
    const redirect = safeRedirectPath(req.query.redirect, frontendUrl);
    const stateCookie = jwt.sign({ state, codeVerifier, redirect }, settings.jwtSecret, {
      audience: 'shopeasy-google-oauth',
      expiresIn: '10m',
    });

    res.cookie(OAUTH_COOKIE, stateCookie, oauthCookieOptions());
    res.redirect(oauthClient.generateAuthUrl({
      response_type: 'code',
      redirect_uri: settings.redirectUri,
      scope: ['openid', 'email', 'profile'],
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    }));
  } catch (error) {
    console.error('Could not start Google sign-in:', error.message);
    const target = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
    redirectFailure(res, new URL(target).origin, 'google_unavailable');
  }
});

router.get('/google/callback', oauthLimiter, async (req, res) => {
  let settings;
  try {
    settings = config();
  } catch (error) {
    clearOAuthCookie(res);
    const target = process.env.FRONTEND_URL || 'http://localhost:5173';
    redirectFailure(res, new URL(target).origin, 'google_unavailable');
    return;
  }

  const pending = validatedState(req, settings.jwtSecret);
  if (!pending || typeof req.query.state !== 'string' || pending.state !== req.query.state) {
    clearOAuthCookie(res);
    redirectFailure(res, settings.frontendUrl, 'invalid_state');
    return;
  }

  clearOAuthCookie(res);
  if (req.query.error) {
    redirectFailure(res, settings.frontendUrl, req.query.error === 'access_denied' ? 'google_denied' : 'google_failed');
    return;
  }
  if (typeof req.query.code !== 'string' || typeof pending.codeVerifier !== 'string') {
    redirectFailure(res, settings.frontendUrl, 'google_failed');
    return;
  }

  try {
    const oauthClient = createOAuthClient(settings);
    const { tokens } = await oauthClient.getToken({
      code: req.query.code,
      codeVerifier: pending.codeVerifier,
      redirect_uri: settings.redirectUri,
    });
    if (!tokens.id_token) throw new Error('Google did not return an ID token');

    const ticket = await oauthClient.verifyIdToken({ idToken: tokens.id_token, audience: settings.clientId });
    const profile = ticket.getPayload();
    const issuerIsGoogle = ['accounts.google.com', 'https://accounts.google.com'].includes(profile?.iss);
    const audienceMatches = Array.isArray(profile?.aud) ? profile.aud.includes(settings.clientId) : profile?.aud === settings.clientId;
    const notExpired = Number(profile?.exp) * 1000 > Date.now();
    if (!issuerIsGoogle || !audienceMatches || !notExpired || !profile?.sub) throw new Error('Invalid Google identity token');
    if (profile.email_verified !== true) {
      redirectFailure(res, settings.frontendUrl, 'email_unverified');
      return;
    }
    if (!profile.email) throw new Error('Google account has no email address');

    const email = profile.email.trim().toLowerCase();
    let user = await User.findOne({ googleId: profile.sub });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        if (user.googleId && user.googleId !== profile.sub) {
          redirectFailure(res, settings.frontendUrl, 'account_link_conflict');
          return;
        }
        user.googleId = profile.sub;
        user.emailVerified = true;
        if (!user.avatar && profile.picture) user.avatar = profile.picture;
        await user.save();
      } else {
        user = await User.create({
          name: profile.name || email.split('@')[0],
          email,
          avatar: profile.picture || '',
          googleId: profile.sub,
          provider: 'google',
          emailVerified: true,
        });
      }
    }

    setSessionCookie(res, generateToken(user));
    const destination = new URL(safeRedirectPath(pending.redirect, settings.frontendUrl), settings.frontendUrl);
    res.redirect(destination.toString());
  } catch (error) {
    console.error('Google sign-in failed:', error.message);
    redirectFailure(res, settings.frontendUrl, 'google_failed');
  }
});

export default router;

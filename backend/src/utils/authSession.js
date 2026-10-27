export const SESSION_COOKIE = 'shopeasy_session';

export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const setSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
};

export const clearSessionCookie = (res) => {
  const options = { ...sessionCookieOptions() };
  delete options.maxAge;
  res.clearCookie(SESSION_COOKIE, options);
};

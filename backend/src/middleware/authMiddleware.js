import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { SESSION_COOKIE } from '../utils/authSession.js';

export const protect = async (req, res, next) => {
  let token;
  const jwtSecret = process.env.JWT_SECRET;

  if (req.cookies?.[SESSION_COOKIE]) {
    token = req.cookies[SESSION_COOKIE];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    if (!jwtSecret) throw new Error('JWT_SECRET is not configured');
    const decoded = jwt.verify(token, jwtSecret);

    req.user = await User.findById(decoded.id).select('-password -googleId');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};



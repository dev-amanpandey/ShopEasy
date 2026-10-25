import express from 'express';
import { rateLimit } from 'express-rate-limit';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { clearSessionCookie, setSessionCookie } from '../utils/authSession.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const passwordAuthLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || '',
  provider: user.provider || 'local',
  emailVerified: Boolean(user.emailVerified),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// POST /api/auth/signup
router.post('/signup', passwordAuthLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });

    setSessionCookie(res, generateToken(user));

    res.status(201).json({
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', passwordAuthLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google sign-in. Continue with Google, or set a password from your account settings.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    setSessionCookie(res, generateToken(user));

    res.json({
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ message: 'Logged out' });
});

router.get('/wishlist', protect, async (req, res) => {
  res.json({ wishlistProductIds: req.user.wishlistProductIds || [] });
});

router.put('/wishlist', protect, async (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.some((id) => !/^[1-9]\d*$/.test(String(id)))) {
    return res.status(400).json({ message: 'Wishlist product IDs must be positive integers' });
  }

  try {
    const wishlistProductIds = [...new Set(productIds.map(String))];
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { wishlistProductIds } },
      { new: true, runValidators: true }
    ).select('wishlistProductIds');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ wishlistProductIds: user.wishlistProductIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update wishlist' });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (typeof avatar === 'string') {
      if (avatar.length > 1_000_000) {
        return res.status(400).json({ message: 'Profile picture is too large' });
      }
      user.avatar = avatar;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password;
    }

    const updatedUser = await user.save();

    res.json({ user: formatUser(updatedUser) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



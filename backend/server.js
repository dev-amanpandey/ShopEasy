import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import googleAuthRoutes from './src/routes/googleAuthRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
//import { findDOMNode } from 'react-dom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer backend/.env when running node backend/server.js from workspace root.
dotenv.config({ path: path.resolve(__dirname, '.env') });
// Also load root .env as a fallback if present.
dotenv.config();

const app = express();

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const allowedOrigins = new Set(
  [
    ...(process.env.CLIENT_ORIGIN || '').split(','),
    process.env.FRONTEND_URL || '',
    'https://e-commerce-lac-beta-32.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean)
);

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});







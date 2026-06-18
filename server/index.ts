import dotenv from 'dotenv';
dotenv.config();

import WebSocket from 'ws';

// @ts-ignore
global.WebSocket = WebSocket;

import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/bookingRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import paymentRoutes from './routes/paymentRoutes';
import cmsRoutes from './routes/cmsRoutes';
import zoomRoutes from './routes/zoom';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import { reminderScheduler } from './services/reminderScheduler';
import { availabilityService } from './services/availabilityService';

const app = express();


// --- PRODUCTION CORS CONFIG ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL,
  'https://thelumaflow.com'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow all origins for convenience
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn(`CORS blocked origin: ${origin}`);
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists on startup
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json({
  limit: '10mb',
  verify: (req: any, res, buf) => {
    if (req.originalUrl.startsWith('/api/payments/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));


// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/zoom', zoomRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);

const PORT = process.env.PORT || 3001;

// Initialize Reminder Scheduler (every 15 minutes)
const RUN_INTERVAL = 15 * 60 * 1000;

setInterval(() => {
  reminderScheduler.checkAndSendReminders().catch(err => {
    console.error('Scheduler Error:', err);
  });
}, RUN_INTERVAL);

// Run immediately on startup
reminderScheduler.checkAndSendReminders();

// Prune past blocked slots every 24 hours
const PRUNE_INTERVAL = 24 * 60 * 60 * 1000;

setInterval(() => {
  availabilityService.prunePastBlockedSlots().catch(err => {
    console.error('Pruning Error:', err);
  });
}, PRUNE_INTERVAL);

// Run immediately on startup
availabilityService.prunePastBlockedSlots().catch(err => {
  console.error('Startup Pruning Error:', err);
});
availabilityService.seedAvailabilitySettings().catch(err => {
  console.error('Startup Seeding Error:', err);
});

app.listen(PORT, () => {
  console.log(`
  🌙 LUMAFLOW PRODUCTION BACKEND
  -----------------------------
  Status: Operational
  Port: ${PORT}
  Database: Connected
  FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
  `);
});
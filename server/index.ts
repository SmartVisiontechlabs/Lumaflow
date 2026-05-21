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
import { reminderScheduler } from './services/reminderScheduler';

const app = express();

// --- PRODUCTION CORS CONFIG ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  'https://thelumaflow.com'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cms', cmsRoutes);

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
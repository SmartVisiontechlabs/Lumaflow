import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/bookingRoutes';
import availabilityRoutes from './routes/availabilityRoutes';


const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
  🌙 LUMAFLOW PRODUCTION BACKEND
  -----------------------------
  Status: Operational
  Port: ${PORT}
  Database: Supabase (PostgreSQL)
  API: http://localhost:${PORT}/api
  `);
});

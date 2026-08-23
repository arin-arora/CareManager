import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import prisma from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3002', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date()
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: err.message,
      timestamp: new Date()
    });
  }
});

import adminRoutes from './routes/admin';
import doctorRoutes from './routes/doctor';
import appointmentRoutes from './routes/appointment';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Something went wrong on the server' });
});

import { outboxProcessor } from './services/outboxProcessor';
import { reminderService } from './services/reminderService';

// Start Server
app.listen(PORT, async () => {
  console.log(`✓ Server running on port ${PORT}`);
  try {
    await prisma.$connect();
    console.log('✓ Connected to PostgreSQL via Prisma');
    outboxProcessor.start();
    reminderService.startWorker();
  } catch (err: any) {
    console.error('✗ Failed to connect to database:', err.message);
  }
});
export default app;

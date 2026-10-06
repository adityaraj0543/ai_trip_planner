import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import tripRoutes from './routes/trip.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const frontendDist = path.join(projectRoot, 'frontend', 'dist');

const app = express();

app.use(cors({ origin: env.frontendUrl === '*' ? true : env.frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'tripgenius-api',
    environment: env.nodeEnv,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/payments', paymentRoutes);

// In production Render can run one web service: Express serves the Vite build.
if (env.nodeEnv === 'production') {
  app.use(express.static(frontendDist));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

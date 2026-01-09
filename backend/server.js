import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import './database.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import readingsRoutes from './routes/readings.js';
import applicationsRoutes from './routes/applications.js';
import newsRoutes from './routes/news.js';
import feedbackRoutes from './routes/feedback.js';
import plumbersRoutes from './routes/plumbers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*'
    : '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/plumbers', plumbersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`API available at /api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

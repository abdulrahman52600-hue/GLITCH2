import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import 'dotenv/config';
import { initDatabase } from './db/database.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import applicationRoutes from './routes/applications.js';
import mentorRoutes from './routes/mentors.js';
import adminRoutes from './routes/admin.js';
import assessmentRoutes from './routes/assessments.js';
import notificationRoutes from './routes/notifications.js';
import authProviderRoutes from './routes/authProviders.js';
import { rateLimit } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map(v => v.trim()) : true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json({ limit: '200kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, max: 180 }));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authProviderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Student-Industry Bridge API',
    timestamp: new Date().toISOString()
  });
});

// Serve the production React app
app.use(express.static(clientDistPath));

// React SPA fallback: allow direct URLs such as /login and /explore
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server & Database
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Student-Industry Bridge API running on http://localhost:${PORT}`);
  });
}

startServer();

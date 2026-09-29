import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit } from 'express-rate-limit';

// Load env vars
dotenv.config();

// Import routes
import eventsRouter from './routes/events';
import categoriesRouter from './routes/categories';
import registrationsRouter from './routes/registrations';
import scheduleRouter from './routes/schedule';
import announcementsRouter from './routes/announcements';
import resultsRouter from './routes/results';
import galleryRouter from './routes/gallery';
import sponsorsRouter from './routes/sponsors';
import contactRouter from './routes/contact';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// ── Security Middleware ──────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // In development allow any localhost/127.0.0.1 port
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Rate Limiting ────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { error: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/registrations', registrationLimiter);

// ── Body Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ── Static Files (Uploads) ───────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Root API & Health Check ──────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: 'COLORIDO 2K26 API',
    status: 'ok',
    message: 'API is running'
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'COLORIDO 2K26 API'
  });
});

// ── Public API Routes ─────────────────────────────────────────────
app.use('/api/events', eventsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/results', resultsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/sponsors', sponsorsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/upload', uploadRouter);

// ── Auth & Admin Routes ───────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// ── 404 Handler ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ error: err.message, stack: err.stack });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Start Server ──────────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🎭 COLORIDO 2K26 API Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health: http://localhost:${PORT}/health\n`);
  });
}

export default app;

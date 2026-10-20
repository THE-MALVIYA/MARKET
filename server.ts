import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authMiddleware } from './server/middleware/auth';
import { rateLimit } from './server/middleware/rateLimit';
import productsRouter from './server/routes/products';
import ordersRouter from './server/routes/orders';
import adminRouter from './server/routes/admin';
import authRouter from './server/routes/auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS and Preflight handling for browser clients and iframes
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-user-role, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Middleware: JSON with 10mb limit for screenshot uploads & rate limiting
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(rateLimit(60000, 200));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Global auth context attachment
  app.use(authMiddleware);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ONLINE',
      system: 'CYBERPLACES MARKETPLACE PLATFORM',
      timestamp: new Date().toISOString(),
      network: 'USDT-TRC20',
      securityMode: 'ACTIVE_CYBER'
    });
  });

  // API Routes
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/auth', authRouter);

  // Serve static uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYBERPLACES] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CYBERPLACES] Fatal server start error:', err);
  process.exit(1);
});

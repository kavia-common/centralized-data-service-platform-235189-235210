'use strict';

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const swaggerSpec = require('../swagger');

const { requestContext, httpLogger, createRateLimiter, errorHandler } = require('./middleware');
const { bootstrapDatabase } = require('./db/bootstrap');

// Initialize express app
const app = express();

app.set('trust proxy', process.env.TRUST_PROXY === 'true');

app.use(helmet());
app.use(requestContext());
app.use(httpLogger());
app.use(createRateLimiter());

// CORS: prefer ALLOWED_ORIGINS env list, fallback to '*'
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser requests
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: (process.env.ALLOWED_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS').split(','),
    allowedHeaders: (process.env.ALLOWED_HEADERS || 'Content-Type,Authorization').split(','),
    maxAge: Number.parseInt(process.env.CORS_MAX_AGE || '3600', 10),
  })
);

// Parse JSON request body
app.use(express.json({ limit: '1mb' }));

/**
 * Bootstrap DB tables on app startup.
 * Note: this runs once when the module is loaded; if DB env is missing, it will fail fast.
 */
bootstrapDatabase().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Database bootstrap failed:', err);
  process.exit(1);
});

app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.protocol;

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) || (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };

  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Mount routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import swaggerSpec from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.route.js';
import memoryRouter from './routes/memory.route.js';
import chatRouter from './routes/chat.route.js';
import mcpRouter from './routes/mcp.route.js';

/**
 * @module app
 * Express application factory.
 * Creates and configures the Express app with all middleware and routes.
 * Separated from the entry point so the app can be imported in tests
 * without starting a server.
 */

/**
 * Creates and returns a fully configured Express application.
 * Registers middleware (helmet, CORS, JSON body parser, Swagger UI)
 * and mounts all route handlers. Does NOT call `app.listen()`.
 *
 * @returns Configured Express application instance
 */
export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '200kb' }));

  const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
    .map((o: string) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    }),
  );

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs/spec.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use('/api/v1', authRouter);
  app.use('/api/v1/memories', memoryRouter);
  app.use('/api/v1/chat', chatRouter);
  app.use('/api/v1/mcp', mcpRouter);

  app.use(errorHandler);

  return app;
}

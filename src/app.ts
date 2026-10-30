import express, { type Request, type Response } from 'express';
import { FRONTEND_URL_ENV } from './config/env.js';
// Routes
import chatRoutes from './routes/chat.routes.js';
import userRoutes from "./routes/user.routes.js";
import upsertRoutes from "./routes/upsert.routes.js";

// Middlewares
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalApiLimiter, strictAuthLimiter } from "./Middleware/rateLimiter.js";
import { requestLogger } from './Middleware/logger.middleware.js';
import { protect, restrictTo } from "./Middleware/auth.js";

const app = express();

// Middlewares
app.use(
    cors({
        origin: FRONTEND_URL_ENV || 'http://localhost:3000',
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);


// Routes
app.get('/', (req:Request, res:Response) => {
    res.send('API is running...');
});

app.use('/api/upset', protect, restrictTo('admin'), globalApiLimiter, upsertRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', strictAuthLimiter, userRoutes);

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
    });
});

export default app;
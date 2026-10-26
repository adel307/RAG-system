import express, { type Request, type Response } from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatRoutes);

app.get('/', (req:Request, res:Response) => {
  res.send('API is running...');
});

export default app;
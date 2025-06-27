import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './interfaces/routes/userRoutes';
import conversationRoutes from './interfaces/routes/conversationRoutes';
import messageRoutes from './interfaces/routes/messageRoutes';
import attachmentRoutes from './interfaces/routes/attachmentRoutes';
import authRoutes from './interfaces/routes/authRoutes';
import emailRoutes from './interfaces/routes/emailRoutes';
import absenceRoutes from './interfaces/routes/absenceRoutes';
import path from 'path';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cleanarch';

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Demo endpoints from demoapp/app.js
app.post('/post', (req, res) => {
  console.log('Connected to React');
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server!';
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

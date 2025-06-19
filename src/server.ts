import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './interfaces/routes/userRoutes';
import conversationRoutes from './interfaces/routes/conversationRoutes';
import messageRoutes from './interfaces/routes/messageRoutes';
import attachmentRoutes from './interfaces/routes/attachmentRoutes';
import authRoutes from './interfaces/routes/authRoutes';
import path from 'path';
import cors from 'cors';

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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Demo endpoints from demoapp/app.js
app.post('/post', (req, res) => {
  console.log('Connected to React');
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
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

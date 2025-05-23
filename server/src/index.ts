import express from 'express';
import cors from 'cors';
import notificationsRouter from './routes/notifications';
import authRouter from './routes/auth';
import postsRouter from './routes/posts';
import friendsRouter from './routes/friends';
import groupsRouter from './routes/groups';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/notifications', notificationsRouter);

const PORT = parseInt(process.env.PORT || '5001', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
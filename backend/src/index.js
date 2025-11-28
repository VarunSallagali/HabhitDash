import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import './db.js'; // Initialize MongoDB connection
import authRoutes from './routes/auth.js';
import habitsRoutes from './routes/habits.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => res.send({ ok: true, msg: 'HabitDash API' }));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log('Server running on', port);
});



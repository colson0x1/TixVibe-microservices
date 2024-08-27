import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  // Detect error immediately and throw an error when we start to deploy
  // our code
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  // If DB connects successfully above, then its actually time for listening
  // traffic
  app.listen(3000, () => {
    console.log('Listening on port 3000!!!');
  });
};

start();
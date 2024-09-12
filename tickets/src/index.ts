import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  // Detect error immediately and throw an error when we start to deploy
  // our code
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  // Connect to MongoDB instance successfully through Mongoose before we ever
  // even startup our Express application or technically start listenign to
  // traffic at port 3000
  // Just as this application really needs to have a connection to MongoDB to
  // work successfully, it also needs to have a connection to NATS Streaming
  // Server in order for it to work successfully!
  try {
    await natsWrapper.connect('tixvibe', 'stillhome', 'htttp://nats-srv:4222');

    await mongoose.connect(process.env.MONGO_URI);
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

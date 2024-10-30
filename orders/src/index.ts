import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';

const start = async () => {
  // Detect error immediately and throw an error when we start to deploy
  // our code
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  // Connect to MongoDB instance successfully through Mongoose before we ever
  // even startup our Express application or technically start listenign to
  // traffic at port 3000
  // Just as this application really needs to have a connection to MongoDB to
  // work successfully, it also needs to have a connection to NATS Streaming
  // Server in order for it to work successfully!
  try {
    // await natsWrapper.connect('tixvibe', 'stillhome', 'htttp://nats-srv:4222');
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL,
    );
    // Exit process entirely anytime we lose connection to NATS Streaming Server
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    // @ Graceful shutdown anytime a Client is about to close down
    // Handlers to watch for any single time that someone tries to close down
    // this process
    // These event handlers are watching for interrupt signals or terminate signals
    // @ SIGINT - Signal Intercept (Ex: rs while running ts-node-dev)
    // @ SIGTERM - Signal Terminate (Ex: killing terminal with Ctrl+C)
    // i.e Close the client manually as well anytime we get interrupt signal
    // or terminate singal
    // `this._client!` or alternatively `this.client` which is better way
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    /* this._client.on('connect', () => {
      console.log('Connected to NATS')
    }) */

    // Right after we go through all that initialization stuff for NATS, right
    // after above is a good time to start listening for incoming events
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();

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

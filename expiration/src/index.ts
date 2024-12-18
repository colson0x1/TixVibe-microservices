/* @ Expiration Service */

import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  console.log('Starting Expiration Service...');
  // Detect error immediately and throw an error when we start to deploy
  // our code
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

    // After connecting to NATS, start listener by creating an instance of
    // the listener
    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();

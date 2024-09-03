import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const stan = nats.connect('tixvibe', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    // Get list of all the events that has been emitted in the past
    .setDeliverAllAvailable()
    // Create Durable Subscription so when event is emitted, NATS is going to
    // record whether or not the subscription has received and successfully
    // processed that event!
    // i.e To make sure that we keep track of all the different events that
    // have gone to this subscription or the this queue group even if it goes
    // offline for a little bit
    .setDurableName('orders-service');

  // Second argument to subscribe is the name of the Queue Group that we want
  // to join
  const subscription = stan.subscribe(
    'ticket:created',
    // Queue group name to make sure we do not accidentally dump the durable
    // name if all of our services restart for a very brief period of time
    // and to make sure that all these emitted events only go off to one instance
    // of our services, even if we are running multiple instances
    'orders-service-queue-group',
    options,
  );

  subscription.on('message', (msg: Message) => {
    // console.log('Message received');
    const data = msg.getData();

    if (typeof data === 'string') {
      console.log(
        // `Received event #${msg.getSequence()}, with data: ${JSON.parse(data)}`,
        `Received event #${msg.getSequence()}, with data: ${data}`,
      );
    }

    msg.ack();
  });
});

// @ Graceful shutdown anytime a Client is about to close down
// Handlers to watch for any single time that someone tries to close down
// this process
// These event handlers are watching for interrupt signals or terminate signals
// @ SIGINT - Signal Intercept (Ex: rs while running ts-node-dev)
// @ SIGTERM - Signal Terminate (Ex: killing terminal with Ctrl+C)
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

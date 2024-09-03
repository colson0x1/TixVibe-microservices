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

  // Second argument to subscribe is the name of the Queue Group that we want
  // to join
  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable();
  const subscription = stan.subscribe(
    'ticket:created',
    // 'orders-service-queue-group',
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

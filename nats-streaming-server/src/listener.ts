import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

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

  new TicketCreatedListener(stan).listen();
});

// @ Graceful shutdown anytime a Client is about to close down
// Handlers to watch for any single time that someone tries to close down
// this process
// These event handlers are watching for interrupt signals or terminate signals
// @ SIGINT - Signal Intercept (Ex: rs while running ts-node-dev)
// @ SIGTERM - Signal Terminate (Ex: killing terminal with Ctrl+C)
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

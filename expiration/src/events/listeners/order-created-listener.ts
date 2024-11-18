import { Listener, OrderCreatedEvent, Subjects } from '@tixvibe/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

// Listener base class is a generic function where we have to plug in the
// type of event that we want to listen for i.e OrderCreatedEvent here
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // This gives time in milliseconds
    // And this gives the difference between timeout at some point of time
    // in the future (i.e expiresAt time) and the current time right now
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job', delay);

    // This is the point where we want to create a new job and queue it up.
    // The first argument to `add` is the payload for this job or essentially
    // the information that we want to stick into the job itself.
    // The `data` argument is essentally the Payload that we're going to provide.
    // So for us, we have to provide an object that has an `orderId` property.
    // Here, `orderId` is coming from `data` object that we're receiving into
    // the `onMessage` fn. We're receiving the `data` part of an order created
    // event i.e OrderCreatedEvent['data']
    // And that thing has an `id` property. That is the id of the order that
    // was just created.
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        // What we really have available to us is the current time i.e the
        // time at which we receive this incoming `data` event and inside of
        // this `data` object, we've got a timestamp of `expiresAt`.
        // `expiresAt` is when we want to expire or essentially process this
        // job!
        // delay: 10000,
        delay,
      },
    );

    // Immediately after that, we'll go ahead and ack our message
    msg.ack();
  }
}

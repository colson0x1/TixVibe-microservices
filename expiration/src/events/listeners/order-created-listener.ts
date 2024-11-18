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
    await expirationQueue.add({
      orderId: data.id,
    });

    // Immediately after that, we'll go ahead and ack our message
    msg.ack();
  }
}

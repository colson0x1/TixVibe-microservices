import { Publisher, OrderCreatedEvent, Subjects } from '@tixvibe/common';

// Publisher base class is a generic class where we stick in the event that
// we're going to eventually emit
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

// Now anytime we want to publish an event saying that an order has been created
/* new OrderCreatedPublisher(natsClient).publish({
  // pass all of our different data properties like id, status, expiresAt, price..
}) */

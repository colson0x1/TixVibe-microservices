import { Listener, OrderCreatedEvent, Subjects } from '@tixvibe/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';

// Listener base class is a generic function where we have to plug in the
// type of event that we want to listen for i.e OrderCreatedEvent here
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {}
}

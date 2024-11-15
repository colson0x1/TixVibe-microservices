import { Listener, OrderCancelledEvent, Subjects } from '@tixvibe/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // OrderCancelledEvent has the event data structure for a order that has
    // the reserved ticket id
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // undefined instead of null because existence check like with if statements
    // or question mark in TS i.e optional values with TS don't work terribly
    // well with null. So using `undefined`
    ticket.set({ orderId: undefined });
    await ticket.save();

    // Publish an event saying that a ticket has been updated
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
    });

    msg.ack();
  }
}

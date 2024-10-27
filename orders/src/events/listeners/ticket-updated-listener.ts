import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@tixvibe/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    // Goal: Find the ticket that is being updated, the ticket that is mentiond
    // inside that `data` object and just update the data and save it
    // Step 1 - Pull the ticket out of our Ticket collection using Ticket Model
    const ticket = await Ticket.findById(data.id);

    // There is a chance that we will not find the ticket we're looking for
    // i.e ticket: TicketDoc || null
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Now that we've found the ticket, we can go through and update presumeably
    // the title and the price
    const { title, price } = data;
    ticket.set({ title, price });
    // Save the updated ticket
    await ticket.save();

    // Acknowledge the message and tell NATS streaming server that we've
    // successfully processed it
    msg.ack();
  }
}

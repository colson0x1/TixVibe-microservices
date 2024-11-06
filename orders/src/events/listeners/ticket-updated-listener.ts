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
    /* const ticket = await Ticket.findById(data.id); */
    // Make query based on two different criteria i.e both the `id` and the
    // `version` number
    /* const ticket = await Ticket.findOne({
      // We want to find a ticket with an id and version number
      _id: data.id,
      version: data.version - 1,
    }); */
    // Using the abstracted method that is implemented direcly within the
    // Ticket model itself
    const ticket = await Ticket.findByEvent(data);

    // There is a chance that we will not find the ticket we're looking for
    // i.e ticket: TicketDoc || null
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Now that we've found the ticket, we can go through and update presumeably
    // the title and the price
    /* 
    const { title, price } = data;
    ticket.set({ title, price }); 
    */
    // Not relying on mongoose-update-if-current plugin
    // Make version number of the record in Orders DB as same as the version
    // number in the  event from another service
    // Doing so, now we're no longer coupled to this plugins understanding of
    // how these version numbers increment
    // Instead we're using the precise version that was included inside
    // of this data object
    // So now inside the data object, we could potentially have version numbers
    // like where they are incremented by 100 every single time or we could
    // potentially have timestamps. It really doesn't matter. We're just
    // saying take whatever this new version number is inside this event, assign
    // it to our record and save it because now that is the current version!
    const { title, price, version } = data;
    ticket.set({ title, price, version });
    // Save the updated ticket
    await ticket.save();

    // Acknowledge the message and tell NATS streaming server that we've
    // successfully processed it
    msg.ack();
  }
}

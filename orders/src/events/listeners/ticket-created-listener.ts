import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@tixvibe/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

// Listener is a generic type
// The type for this is the type of event that we're going to listen for
// i.e Event Type
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // Two step process here because to make sure TS enforces us to never be
  // able to change this subject property at any point in time
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  // onMessage is going to receive two arguments
  // first is gonna be the data from inside of our event
  // and second is gonna be the message from the node-nats-streaming library
  // `data: TicketCreatedEvent['data]`
  // That means, to make sure we appply the type checking on the data flowing
  // into this `onMessage` function, we reference the event type interface
  // i.e `TicketCreatedEvent` and we're saying, off that interface, take a
  // look at the `data` property and thats gonna be the type of this `data`
  // argument on `onMessage`
  // Message is the object in node-nats-streaming that has many methods
  // out of which `ack()` being the most important method
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    // Take a loook at the `data` from the argument
    // The only property we really want to persist inside of Orders Service is
    // the `title` and `price`
    // Its already defined inside of Ticket Model `models/ticket.ts` interface
    // inside of Orders Service
    // So pull off title and price from data
    /* const { title, price } = data; */
    // Get the id of the ticket too so that same id can be used to save
    // in the local ticket collection of Orders Service
    const { id, title, price } = data;

    // Use that to build a new ticket
    /*
    const ticket = Ticket.build({
      title,
      price,
    });
    */
    // That above doesn't work!
    // That above will create a random ID for the ticket created from
    // Ticket Service into the local ticket collection of Orders Service
    // that is listening to the event ticket:created
    // i.e ticket ID isn't identical whenever replicating data across different
    // services
    // So we've to adjust the build function
    // Adjust the build function in `models/Ticket.ts` to receive `id`
    // + Also convert the `id` property from ticket that was converted to
    // `id` from `_id` in JSON while transmitting the event, do convert
    // the `id` to `_id` from event data so that it will be saved as `_id`
    // in the local ticket collection of Orders Service in `models/ticket.ts`
    const ticket = Ticket.build({
      id,
      title,
      price,
    });

    // And then save it
    await ticket.save();

    // Ack that message to tell NATS streaming server that we've successfully
    // processed this thing and we're good to go!
    msg.ack();
  }
}

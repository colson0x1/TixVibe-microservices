// To create a listener, at the very minimum remember to import Listener
// base class or subclass from the common library
// After that TypeScript will help implement the listener

// i.e just remember these two parts, after that, TS is gonna help us the
// rest of the way
/*
import { Listener } from "@tixvibe/common";

export class OrderCreatedListener extends Listener {}
*/
// And third thing we have to remember is that Listener is a generic fn
// and it requires a type argument and that type argument is the event type
// and its name is kind of same as the class OrderCreatedListener initial
// i.e OrderCreatedEvent from the common library

import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@tixvibe/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

// Stick in the event that we want to listen for as a generic argument type for
// Listener
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  // This thing is going to have two arguments provided
  // The first is gonna be the data property of the event that we are listening
  // for
  // And second argument will be the Message type from the node-nats-streaming
  // library
  // onMessage can have some async code inside of it so mark it as async fn
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Reach onto the Ticket collection and Find the ticket that the order is
    // reserving
    const ticket = await Ticket.findById(data.ticket.id);
    // That is the `ticket` we're trying to reserve

    // If no ticket, throw error
    // This might happen if the evens flow out of order or something like that.
    // And maybe we erronously set that a ticket was being reserved when the
    // ticket didn't even exist
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its `orderId` property
    // data.id is the id of the order that was just created
    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();

    // ack the message
    msg.ack();
  }
}

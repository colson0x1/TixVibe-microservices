import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@tixvibe/common';
import { Ticket } from '../../models/ticket';

// Listener is a generic type
// The type for this is the type of event that we're going to listen for
// i.e Event Type
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // Two step process here because to make sure TS enforces us to never be
  // able to change this subject property at any point in time
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'orders-service';

  // onMessage is going to receive two arguments
  // first is gonna be the data from inside of our event
  // and second is gonna be the message from the node-nats-streaming library
  onMessage(data: TicketCreatedEvent['data'], msg: Message) {}
}

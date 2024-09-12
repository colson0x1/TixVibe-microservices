import { Publisher, Subjects, TicketCreatedEvent } from '@tixvibe/common';

// Publisher base class is a generic class which needs to be provided with
// type of event that we're going to try to emit with this Publisher
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  // `Subject` is name of the channel that we want to emit this event to
  /* subject: Subjects.TicketCreated = Subjects.TicketCreated; */
  readonly subject = Subjects.TicketCreated;
}

// Now in some other file, it can be imported and be used to publish an event
/* new TicketCreatedPublisher(client).publish(ticket) */

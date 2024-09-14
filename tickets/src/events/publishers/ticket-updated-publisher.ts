import { Publisher, Subjects, TicketUpdatedEvent } from '@tixvibe/common';

// Publisher base class is a generic class which needs to be provided with
// type of event that we're going to try to emit with this Publisher
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  // `Subject` is name of the channel that we want to emit this event to
  /* subject: Subjects.TicketUpdated = Subjects.TicketUpdated; */
  readonly subject = Subjects.TicketUpdated;
}

// Now in some other file, it can be imported and be used to publish an event
/* new TicketUpdatedPublisher(client).publish(ticket) */

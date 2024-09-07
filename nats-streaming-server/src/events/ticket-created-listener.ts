import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // subject = 'ticket:created';
  // We have to give type annotation to this subject because TS thinks that
  // we might try to change the value of subject at some point in the future.
  // So by providing this Type Annotation right here, this makes sure that we
  // can never change the value of subject to anything else!
  // It must always equal to the value of TicketCreated.
  // Now we no longer have to write out a plain string inside of our listener
  // which is always a place where we can make a typo very easily.
  // Now we always have to refer to the Subjects enum. That means we only ever
  // have to write out subject name once inside of subjects.ts
  /* subject: Subjects.TicketCreated = Subjects.TicketCreated; */
  // Or we can use `readonly` which prevents a property of a class from being
  // changed.
  // Hence, readonly makes sure that a given property does not get changed!
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  // Inside of onMessage, we're presumably going to have some business logic
  // inside of here. And if the business logic fails for any reason, we want to
  // just allow this message to time out, to fail, deliver essebtially so that
  // NATS attempts to redeliver it automatically at some point in the future!
  // So if everything goes correctly, we're going to call `msg.ack()` to acknowledge
  // the message otherwise if something goes poorly, we're not going to ack the
  // message and just allow the message to time out.
  /* onMessage(data: any, msg: Message): void { */
  // Referencing data equal to the data property of the type argument
  // i.e data property off of the TicketCreatedEvent interface
  // This is now going to enforce TS to encorce some type checking on the
  // properties we try to access on this `data` argument so we can no longer
  // access properties that don't actually exists!
  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    // Inside of here, run whatever business logic we want to run
    // We can try to take the data, handle it in some fashion, update something
    // in our database or whatever we need to do
    //
    console.log('Event data!', data);

    console.log(data.id);
    console.log(data.price);
    console.log(data.title);

    // This is whats going to actually mark this messsage as successfully
    // having been parsed
    msg.ack();
  }
}

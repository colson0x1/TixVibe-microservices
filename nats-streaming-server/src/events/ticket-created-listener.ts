import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';

export class TicketCreatedListener extends Listener {
  subject = 'ticket:created';
  queueGroupName = 'payments-service';

  // Inside of onMessage, we're presumably going to have some business logic
  // inside of here. And if the business logic fails for any reason, we want to
  // just allow this message to time out, to fail, deliver essebtially so that
  // NATS attempts to redeliver it automatically at some point in the future!
  // So if everything goes correctly, we're going to call `msg.ack()` to acknowledge
  // the message otherwise if something goes poorly, we're not going to ack the
  // message and just allow the message to time out.
  onMessage(data: any, msg: Message): void {
    // Inside of here, run whatever business logic we want to run
    // We can try to take the data, handle it in some fashion, update something
    // in our database or whatever we need to do
    //
    console.log('Event data!', data);

    // This is whats going to actually mark this messsage as successfully
    // having been parsed
    msg.ack();
  }
}

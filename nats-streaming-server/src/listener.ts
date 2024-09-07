import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const stan = nats.connect('tixvibe', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

// @ Graceful shutdown anytime a Client is about to close down
// Handlers to watch for any single time that someone tries to close down
// this process
// These event handlers are watching for interrupt signals or terminate signals
// @ SIGINT - Signal Intercept (Ex: rs while running ts-node-dev)
// @ SIGTERM - Signal Terminate (Ex: killing terminal with Ctrl+C)
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

abstract class Listener {
  /*
   * @ Abstract Prop: subject
   * @ Type: string
   * @ Goal: Name of the channel this listener is going to listen to
   */
  abstract subject: string;
  /*
   * @ Abstract Prop: queueGroupName
   * @ Type: string
   * @ Goal: Name of the queue group this listener will join
   */
  abstract queueGroupName: string;
  /*
   *  @ Abstract Method: onMessage
   *  @ Type: (event: EventData) => void
   *  @ Goal: Function to run when a message is received
   */
  abstract onMessage(data: any, msg: Message): void;
  /*
   * @ Prop: client
   * @ Type: Stan
   * @ Goal: Pre-initialized NATS client
   */
  private client: Stan;
  /*
   * @ Prop: ackWait
   * @ Type: number
   * @ Goal: Number of seconds this listener has to ack a message
   */
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  /*
   *  @ Method: subscriptionOptions
   *  @ Type: SubscriptionOptions
   *  @ Goal: Default subscription options
   */
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  /*
   * @ Method: listen
   * @ Type: () => void
   * @ Goal: Code to set up the subscription
   */
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions(),
    );

    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  /*
   * @ Method: parseMessage
   * @ Type: (msg: Message) => any
   * @ Goal: Helper function to parse the incoming message and pull the data out of it
   */
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}

class TicketCreatedListener extends Listener {
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

import { Message, Stan } from 'node-nats-streaming';

export abstract class Listener {
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

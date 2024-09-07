import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T['subject'];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  /*
   * @ Method/Fn: publish
   * @ Goal: To take some event data and publish it off to the NATS Streaming
   * Server
   */
  // We are't resolving with anything so we're going to put custom type annotation
  // of Promise and say that this is going to resolve to nothing at all.
  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      // The first argument to this callback function is error object. This will
      // be null if no error occurred or will be some error if something went
      // wrong.
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          // If there's error, return early and reject with the error that
          // just occurred
          return reject;
        }

        console.log('Event published to subject', this.subject);
        resolve();
      });
    });
  }
}

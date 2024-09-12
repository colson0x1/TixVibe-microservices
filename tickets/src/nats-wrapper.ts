import nats, { Stan } from 'node-nats-streaming';

/*
 * @ NATS Client
 * @ Create NATS client
 * @ Initialize NATS client from index.ts
 * */
class NatsWrapper {
  // `?` tells TS that this property might be undefined for some period of time
  private _client?: Stan;

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    /* this._client.on('connect', () => {
      console.log('Connected to NATS')
    }) */

    // Refactoring this callback old school to modern async await
    return new Promise<void>((resolve, reject) => {
      this._client!.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      this._client!.on('error', (err) => {
        reject(err);
      });
    });
  }
}

// Export a single instance of NatsWrapper
export const natsWrapper = new NatsWrapper();

import nats, { Stan } from 'node-nats-streaming';

/*
 * @ NATS Client Singleton Class
 * @ Create NATS client
 * @ Initialize NATS client from index.ts
 * */
class NatsWrapper {
  // `?` tells TS that this property might be undefined for some period of time
  private _client?: Stan;

  // Throw error if someone tries to use _client before its actually ready to
  // be used i.e before actually calling connect()
  // :: Getter defines client property on the instance
  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    // If client is already defined i.e if connect is already called
    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    // Refactoring this callback old school to modern async await
    return new Promise<void>((resolve, reject) => {
      // this._client!.on('connect', () => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      // this._client!.on('error', (err) => {
      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

// Export a single instance of NatsWrapper
export const natsWrapper = new NatsWrapper();

// Fake implementation for Nats Wrapper for TEST Environment
/* @ Nats Wrapper instance/object
 * { _client: Stan, client: Stan, connect: () => Promise }
 */
export const natsWrapper = {
  client: {
    publish: (subject: string, data: string, callback: () => void) => {
      callback();
    },
  },
};

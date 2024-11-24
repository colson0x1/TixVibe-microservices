import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@tixvibe/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

const setup = async () => {
  // Build the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create a order from scratch i.e data order event
  const data: OrderCreatedEvent['data'] = {
    // Inside of here, we need to list out a realistic id property for the
    // order itself. All the other properties we could probably make up but
    // at least the id has to be real looking.
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    // We are also not using expiresAt, so we can throw in whatever we like
    expiresAt: 'typemuse',
    // We are also not using expiresAt, so we can throw in whatever string
    userId: 'stillhome',
    status: OrderStatus.Created,
    ticket: {
      // doesn't really matter what the id is
      id: 'Tomorrowland',
      price: 3300,
    },
  };

  // Make msg object thats going to have mocked ack fn
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  /* await listener.onMessage(data, msg); */
  await listener.onMessage(data, msg);

  // Expectation
  // We can try to find the order inside of our orders collection, and just
  // make sure it has the correct price or something like that.
  const order = await Order.findById(data.id);

  // Once order is fetched, make sure it has correct price
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  /* await listener.onMessage(data, msg); */
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderStatus, OrderCancelledEvent } from '@tixvibe/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create a new order and save it to the db
  // This is going to be the order that we'll eventually try to cancel
  const order = Order.build({
    // Give a realistic looking id
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 3300,
    userId: 'stillhome',
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    // We need to make sure this thing has the same id as the oreder we just
    // created above
    id: order.id,
    // all it really matters is the version number here
    // version should definitely be the previous version + 1
    version: 1,
    // ticket id doesn't really matter cause we are not using it here
    ticket: {
      // we can give it any id that we want cause we are not using this id
      id: 'tomorrowland',
    },
  };

  // @ts-ignore
  const msg: Message = {
    // WE'll have a ack fn thats going to be a JEST mock
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup();

  /* await listener.onMessage(data, msg); */
  await listener.onMessage(data, msg);

  // Refetch the order out of the db and make sure its status was updated to
  // cancelled
  // We're going to look at the existing orderm, the same order id
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();

  /* await listener.onMessage(data, msg); */
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

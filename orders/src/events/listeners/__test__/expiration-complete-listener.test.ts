import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderStatus, ExpirationCompleteEvent } from '@tixvibe/common';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Build ticket and save it
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Tomorrowland',
    price: 3300,
  });
  // Save the ticket
  await ticket.save();

  // Build up an order
  const order = Order.build({
    // In this case, we really don't care about the `userId` and we also
    // really don't care all that much about that `expiresMuch` because
    // we're cancelling an order no matter what whenever we receive that
    // expiration:complete event. So we could throw in some arbitrary string
    // for `expiresAt` without a doubt! Hoever, the `ticket` needs to be a real
    // ticket and `status` needs to be the correct status as well.
    // So importing OrderStatus enum from common module.
    status: OrderStatus.Created,
    userId: 'stillhome',
    // expiresAt is a Date. It's a plain string once we've transmit it in our
    // event. But as we're pluggin it into the build method, it does need to be
    // an actual date.
    // So just making a new Date object and throwing that in.
    expiresAt: new Date(),
    // ticket is the ticket which was built above
    ticket,
  });
  // Save that order
  await order.save();

  // Build up fake data object
  const data: ExpirationCompleteEvent['data'] = {
    // This event expects `orderId` property
    orderId: order.id,
  };

  // Build up message
  // @ts-ignore
  const msg: Message = {
    // Its going to have an ack fn that will be a JEST mock
    ack: jest.fn(),
  };

  // Return everything from setup
  return { listener, order, ticket, data, msg };
};

/* Writing 3 separate test instead of 1: RECOMMENDED approach */

it('updates the order status to cancelled', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  /* await listener.onMessage(data, msg); */
  await listener.onMessage(data, msg);

  // Reach into the order collection. Find the order that has been saved,
  // hopefully updated. Fetch it out of that collection and then just make
  // sure that the status property was updated to cancelled pretty much it.
  const updatedOrder = await Order.findById(order.id);
  // We do have order there in const {.., order, ..} = await setup();
  // But in theory, that is an out-of-date version of the order!

  // Make sure that the updated order status property equals order status
  // cancelled
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  /* await listener.onMessage(data, msg); */
  await listener.onMessage(data, msg);

  // Expectation just to make sure that the mock itself, i.e this `publish`
  // function actually was invoked
  // So a kind of two stage expectation is really nice in this regard because
  // we can first make sure that the thing is called and then maybe even if
  // it was called, it might have been given the incorrect arguments.
  // So the two stage kind of setup or two expectations kind of helps us
  // debug stuff in the future.
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // Somehow take a look at our NATS Wrapper mock fn.
  // Get the natsWrapper .client .publish and take a look at that mock and
  // just make sure that it was called!
  // And if we want to, we can also make sure that it was called with a very
  // specific set of arguments.
  // the publish fn in natsWrapper.client.publish is a JEST mock. So to
  // help TS understand that we can put down as: as jest.Mock
  // Than TS is going to understand that this publish thing is supposed to be
  // a mock function and its going to give us access to all the appropriate
  // properties on there without complaining to us a whole bunch.
  // And then, if we want to get access to all the different times this
  // function (i.e natsWrapper.client.publish) has been invoked, we can chain
  // on a `mock.calls` and that's going to be an array of all the different
  // times, all the different arguments that this thing has been provided
  // over time.
  // So `publish` should have only been invoked one single time. So here, we
  // take a look at the first time it was called,
  // i.e (natsWrapper.client.publish as jest.Mock).mock.calls[0]
  // and then maybe we want to
  // just make sure that this event that we just published has the correct
  // orderId. i.e We might just want to make sure that we are emitting the
  // event with the correct orderId.
  // So for that, we can get access to the second argument inside there, because
  // the first argument is the subject or the channel name that we are publishing
  // this event to.
  // i.e (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  // i.e `calls` is the array of all the different times this mock fn was invoked.
  // This is going to give us back the entire data object as JSON. So we're
  // going to have to turn it into an actual object and then we can pull the
  // `id` property out of it.
  console.log((natsWrapper.client.publish as jest.Mock).mock.calls);
  const eventData = JSON.parse(
    // (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
    (natsWrapper.client.publish as jest.Mock).mock.calls[1][1],
  );
  // Expect event data id to equal order id
  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  /* await listener.onMessage(data, msg); */
  await listener.onMessage(data, msg);

  // Take a look at `msg` and make sure that the `ack` function was invoked
  expect(msg.ack).toHaveBeenCalled();
});

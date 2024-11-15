import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@tixvibe/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  // i.e import listener at the top along with the nats wrapper singleton class
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  // i.e This going to be the ticket that we're trying to reserve
  const ticket = Ticket.build({
    title: 'Coachella',
    price: 2500,
    // generate random id using mongoose or put in a fake id
    userId: 'stillhome',
  });
  await ticket.save();

  // Create the fake data event
  // This is gonna be the object thats going to satisfiy the data property of
  // the order-created-event interface
  // To help us put this data object put together, import the interface from
  // common module
  const data: OrderCreatedEvent['data'] = {
    // generate random id using mongoose or put in a fake id
    // In this case, generating a id with mongoose has a pretty good amount of
    // meaning to us. It would be nice to use some realistic looking data.
    id: new mongoose.Types.ObjectId().toHexString(),
    // This thing is presumably just created so it should start with version 0
    version: 0,
    // Whenever order first gets created, its gonna have an order status equal
    // to order created
    // OrderStatus is defined inside of enums in the common module
    status: OrderStatus.Created,
    // fake user id doesn't matter what it is
    userId: 'stillhome',
    // Not really using timestamp here so fake value
    expiresAt: 'abcd',
    // Now something that actually matters is the ticket itself
    ticket: {
      // id of the ticket that we're trying to reserve is gonna be the ticket
      // i.e the id of the ticket that we just built and saved in this app
      // before i.e above
      id: ticket.id,
      // Same with price
      price: ticket.price,
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // Return all the stuff created so that it can be used inside of different
  // tests
  return { listener, ticket, data, msg };
};

/* Test Implementation!
 * Make sure to take the ticket and set its `orderId` property equal to
 * whatever the `orderId` was out of the data event object
 * +
 * Ack the message as soon as everything goes as expected
 */
it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);
  /* await listener.onMessage(data, msg); */

  // In this case, we want to reach into our database once again. We want to
  // find the ticket that has presumably been updated inside there. And just
  // make sure that the ticket has its `orderId` property set
  // NOTE: the ticket right there above i.e const { ticket } = await setup();
  // is an out of date ticket document. Presumably we've already written and
  // updated the version back into our data collection or the collection of
  // all of our different tickets. So we do have to refetch that thing!
  // i.e We wanna find the ticket with the same id below as the one we've above
  // but again we've to refetch that thing because it has some out of date data
  const updatedTicket = await Ticket.findById(ticket.id);

  // Take a look at the updatedTicket and just make sure that its orderId
  // property is set
  // Here, `data.id` is the `id` of the order that we've just created
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  /* await listener.onMessage(data, msg); */

  // Look at the `msg.ack` property and just make sure it was invoked
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);
  /* await listener.onMessage(data, msg); */

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // Optional
  // Take a look at the arguments that are provided to the `publish` fn and
  // make sure that they actually make sense.
  // i.e make sure that we provide some kind of correct `orderId` and what not
  // Here TS thinks `publish` is just a normal function but in reality, it is
  // actually a JEST mock function
  // Tell TS don't sweat it, we've overwritten the definition of this `publish`
  // fn. its actually a mock fn so use ts-ignore
  // @ts-ignore
  /* console.log(natsWrapper.client.publish.mock.calls); */
  // [0] means selecting the first element out of the big array. i.e this is
  // the first invocation of the mock fn and from there, we'll take the
  // second argument ouf of there i.e [0][1]
  // @ts-ignore
  /* console.log(natsWrapper.client.publish.mock.calls[0][1]); */
  // Help TS understand that `publish` is a mocked fn and also so that we can
  // get rid of ts-ignore comment
  // This is going to tell TS that this `publish` is a mock fn and its then
  // going to give us access to all the different properties that a mock fn
  // has such as `.mock`, and the `.calls` property on there and a lot of
  // properties related to mock functions
  // So this is how we can get TS to play around nicely with the mock functions
  /* (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]; */
  // That is going to give us JSON string.
  // Now parsing that string and the presumably pulling off the `orderId`
  // property and make sure we emitted some event with the correct `orderId`
  const ticketUpdatedData = JSON.parse(
    /* (natsWrapper.client.publish as jest.Mock).mock.calls[0][1], */
    (natsWrapper.client.publish as jest.Mock).mock.calls[2][1],
  );

  // Write expectation thats gonna take a look at the `orderId` property on
  // there and make sure that we gave the correct `orderid`
  // Here, real `orderId` is the setup function's data object which was meant
  // to simulate an OrderCreatedEvent. So the data object's `id` property
  // above is the order id
  // So comparing data object's `id` against the ticketUpdatedData's `orderId`
  // property
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});

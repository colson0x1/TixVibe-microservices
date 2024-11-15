import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@tixvibe/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Build listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'Tomorrowland',
    price: 3300,
    userId: 'stillhome',
    // For orderId, we're going to have to also include inside the
    // OrderCancelled event that eventually flows into the listener itself.
    // So we're probably going to want to generate a realistic looking `id`
    // and then assign it to a separate variable so we can make use of it later
    // on.
    // Now if we try to add in the orderId like this below, we get an error.
    // The reason for that is we had assumed that whenever we first create a
    // ticket or whenever we first build one, in this case, we would not yet
    // have an `orderId` to assign to it. So the interface we had assigned
    // to the build function specifically says not going to have an orderId
    // property.
    // We dont have to change the interface for build fn because in reality,
    // our actual aapplication code, we are never going to create a ticket and
    // simultaneously assign an orderId.
    // The simple workaround instead of changing the build interface is, right
    // after we build the ticket, set its `orderId` property.
    // Very simple work around and definitely better in the long term.
    /* orderId, */
  });
  ticket.set({ orderId });
  await ticket.save();

  // Build data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // Build message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

// Rather than writing out two tests and trying to make sure that say we update
// the ticket and save it, and then a separate one for making sure ack
// gets called and then maybe even a separate one for the publisher, instead
// of doing that, here's how i condensed this all down to one test just to
// save a little bit of time
// But its recommended to split this into 3 separate tests
it('updates the ticket, publishes an event, and acks the message', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);
  // Make sure this test fails. It is always worth the time to do this.
  /* await listener.onMessage(data, msg); */

  // Now we're gonna take a look into the database, we're gonna take a look at
  // the Ticket's collection, we're gonna find the ticket right there
  // i.e const { ..., ticket, .. } = await setup(),
  // So we're gonna find the ticket with the same id, and we're going to make
  // sure that it's orderId property was unset. It should be equal to undefined
  const updatedTicket = await Ticket.findById(ticket.id);
  // We want to find the ticket's id and we're going to expect updatedTicket's
  // orderId to be undefined
  expect(updatedTicket!.orderId).not.toBeDefined();
  // Also make sure that we call the ack fn
  expect(msg.ack).toHaveBeenCalled();
  // Also make sure that, publish fn on our natsWrapper client was also invoked
  // In this case, we're just gonna make sure that we do publish an event. Not
  // really checking what event or anything like that but at least we know a
  // event is being published. So good enough for now.
  // It is also recommended to take a look at that mock function's argument
  // like in order-created-listener
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

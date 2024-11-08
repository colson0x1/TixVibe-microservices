import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@tixvibe/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket into our Tickets collection
  // This is gonna be the ticket that we'll try to update
  // This is going to create a ticket in memory i.e it creates just the
  // document
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Tomorrowland',
    price: 3300,
  });

  // Now we have to actually take that ticket and save it to our Tickets
  // collection
  await ticket.save();

  // Create a fake `data` object that describes some update that we're going
  // to make to that ticket that we just saved above
  // Note: If we need a little bit of help on assembling this event or
  // this data object, we can always import the event object or the event type
  // from common module
  const data: TicketUpdatedEvent['data'] = {
    // id is gonna be the same id created above
    id: ticket.id,
    version: ticket.version + 1,
    // Provide different title and price to check
    // userId is not really used inside this Orders Service so we can throw
    // some kind of imaginary userId
    // But different title and price should be provided because that's where
    // assertion should be written to make sure when data object is processed,
    // we end up with whatever title and price are
    title: 'Tomorrowland 2025',
    price: 6600,
    userId: 'stillhome',
  };

  // Create a fake `msg` object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // Return all of this stuff
  return { msg, data, ticket, listener };
};

it('finds, updates, and saves a ticket', async () => {
  // This time setup fn is actually async because we're creating a ticket
  // and saving it onto the DB
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);
  /* await listener.onMessage(data, msg); */

  // Now for expectation
  // Lets try to refetch our ticket out of the Ticket collection. Then make
  // sure we process the data object. And make sure new ticket that we just
  // refetched has the updated title and the updated price.
  // We also want to make sure that we have updated version as well
  // Here on findById, we want to find a ticket with the same id that was
  // created during the setup phase aboved
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);
  /* await listener.onMessage(data, msg); */

  // Take a look at `ack` fn `onMessage` and make sure it was invoked
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener, ticket } = await setup();

  // Make sure that our data object has a version that is far into the future
  data.version = 11;
  /* data.version = 11; */

  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    // We are just using `catch` here to make sure that we do not throw any
    // error out of this entire test which would automatically cause the
    // entire thing to fail
  }

  expect(msg.ack).not.toHaveBeenCalled();
});

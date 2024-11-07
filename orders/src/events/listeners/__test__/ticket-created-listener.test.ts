/* @ Listener Test Implementation
 * Inside every tests, create an instance of a listener, fabricate a data object
 * and fabricate a fake message as well and take that data and message and pass
 * it on onMessage function  and make sure that onMessage does some appropriate
 * thing
 * i.e in the case of ticket-created-listener, make sure if valid data object
 * and valid message is passed into onMessage, it should end up creating a
 * ticket, saving it into the database and also end up calling the messages
 * acknowledge function
 * i.e create a listener, call onMessage and make sure it does something
 * appropriately
 */

// @ Ticket Created Listener
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@tixvibe/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

// Reusuable setup function
// i.e common setup for both these tests below
const setup = async () => {
  // create an instance of a the listener
  // Whenever we call an instance of a listener, we are required to pass in
  // NATS client
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    // The `id` we provide here does have to be a real id because we're
    // eventually take this id and use it to save a new ticket to our local
    // database. So it has to be a legitimate mongodb id
    // i.e generate id using mongoose
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Tomorrowland',
    price: 3300,
    // We're not really using the userId anywhere. None the less, real
    // user id i.e real mongo id is passed here
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create/fabricate a fake message object!
  // data argument is some kind of object that has: id, version, title, price,
  // userId
  // message argument is supposed to be of type Message.
  // Message is a type of object coming from the node-nats-streaming library.
  // The only thing we care about this Message object is for the `ack` function.
  // It has several other functions on it but we don't care about them at all.
  // We want TS to just pretend this thing is a Message even if we do not
  // implement the message correctly i.e provide the fake implementations for
  // each of them. So to ignore, using TS ignore
  // @ts-ignore
  const msg: Message = {
    // In total, `ack` function is the only thing we care about existing in
    // `Message` at all from node-nats-streaming
    // So we're going to implement a fake `ack` function. We're gonna make
    // it a JEST Mock
    // Mock fn is essentially a function thats gonna keep track of how many
    // times it gets called and what arguments is provided. Its really useful
    // whenever we are testing something just to make sure that function
    // actually gets invoked.
    // Now as far as TS is concerned, this is a real Message object. It has
    // the one function that we really care about. And when we pass this into
    // our `onMessage` function inside of our listener i.e ticket-created-listener,
    // and whenever we call `ack`, we're going to actually invoke that mock
    // function. And since it is a mock function, it's going to be really easy
    // for us to test it and make sure that it got called at least once.
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

// Create and save a ticket is what Ticket Created Listener should ideally do
it('creates and saves a ticket', async () => {
  // call the setup fn from the top and get listener, data and msg
  const { listener, data, msg } = await setup();

  // call the `onMessage` function with the `data` object + `message` object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created!
  // i.e write out a query thats going to find some ticket inside the database
  // with the `id` that we've provided and then we can simply write out some
  // assertion and say, hey, lets make sure that this ticket actually exists!
  // Here we'll try to find the ticket with the same id that we've randomly
  // generated and stuck into the data object
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

// If some valid data object and message is provided then ack the message
it('acks the message', async () => {
  // call the `onMessage` function with the `data` object + `message` object
  // write assertions to make sure `ack` function is called!
});

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

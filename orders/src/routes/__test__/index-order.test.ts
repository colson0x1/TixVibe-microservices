import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

// Helper function just to make a little bit easier and concise to
// create 3 tickets
const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 2000,
  });
  await ticket.save();

  return ticket;
};

// only find orders that belongs to the user who is making the request
// in addition, make sure when we get back response, also fetch and supply
// the associated ticket as well
it('fetches orders for an particular user', async () => {
  // Create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  // Storing cookie for users to make "follow up" requests later on
  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order as User #1
  // i.e 1 ticket will be reserved by user number #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Create two orders as User #2
  // i.e 2 tickets will be reserved by user number #2
  // Also, store cookie for user #2 to make follow up requests later on
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for User #2
  // And then when we get that list of orders, we're going to have an expectation
  // to make sure that we got the two orders created for User #2 but not the
  // first order created for user #1
  // i.e We want to make sure that we only fetch orders for the user who is
  // making the request
  const response = await request(app)
    .get('/api/orders')
    // Make this request specifically as user #2
    .set('Cookie', userTwo)
    .expect(200);

  // console.log(orderOne);

  // Now take a look at that response and make sure it got the appropriate
  // information inside of it.
  // Write out some expectations for the data we get back in response from
  // above!
  // So the actual expectation here is,
  // Make sure we only got the orders for User #2
  // console.log(response.body);
  // Make sure we only get back 2 tickets
  expect(response.body.length).toEqual(2);
  // In addition, make sure the 2 orders we got were the correct orders as well
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  // Take a look at the ticket that was embeded on those both as well
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});

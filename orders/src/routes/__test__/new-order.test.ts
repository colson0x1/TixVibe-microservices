import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

// Test for auth
// Test for body validation i.e provide some valid id for the ticket id in
// the body of the request (valid id here means valid mongo db object id)

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  // First create a ticket and save it to the database
  const ticket = Ticket.build({
    title: 'concert',
    price: 2000,
  });
  await ticket.save();

  // Create an order and associate that above ticket with this order and put
  // the order in the correct state as well
  const order = Order.build({
    // Ticket is the ticket created above
    ticket,
    userId: 'macbookpro',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    // Send along the id of the ticket that we're trying to reserve
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {});

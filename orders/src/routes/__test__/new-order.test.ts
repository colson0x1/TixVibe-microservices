import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

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

// We can try to write something that says hey lets reach into the orders
// collection, make sure there are no orders inside there and then after
// making a request, take another look at the orders collection and assert
// that there is at least one order inside
// Since the request handler does send the order as well
// i.e. res.status(201).send(order); // new-order.ts
// So we could potentially also get the response back, take a look at the
// order that was created and attempt to find it inside the orders collection
// So lot of different ways we can improve upon this to make sure that the
// order truly is saved to the database but for right now, 201 is good enough.
// Hence, we can add in that extra little check to make sure everything is
// working truly as expected!
it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 2000,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    // Status code 201 indicating that the order was created
    .expect(201);
});

// Whenever a request comes into to create an order, we publish an event
// saying that an order was created
// it.('emits an order created event');
// Make a request to issue/create the order and issue the event and inspect
// natsWrapper object and make sure that things publish function has been called
it('emits an order created event', async () => {
  // Make sure we successfully create an order
  const ticket = Ticket.build({
    title: 'concert',
    price: 2000,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    // Status code 201 indicating that the order was created
    .expect(201);

  // Immediately we get the 201, we should be able to take a look at our
  // natsWrapper client publish function and just make sure that it has been
  // invoked!
  // expect(natsWrapper.client.publish).toHaveBeenCalled();
  // Test to say that publish function has NOT been invoked
  // expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';

// todos
// * Test to make sure order that the user is looking for actually exists
// so we might want to try to send a request and try to update an order that
// doesn't exist at all and make sure we get back a 404
// * Test to make sure this thing is only accessible if the user is authenticated
// * Test to make sure the `orderId` param looks valid mongodb id
// * Test to make sure user is the owner of the order as well

// Test to make sure order can be created and then make sure that we can make
// the follow up request to delete/cancel it
it('marks an order as cancelled', async () => {
  // Create a ticket with Ticket Model
  const ticket = Ticket.build({
    title: 'concert',
    price: 2000,
  });
  await ticket.save();

  // Create a single user cookie to make a follow up request
  const user = global.signin();

  // Make a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    // we'll make sure that this thing was actually created so we expect 201
    .expect(201);

  // Make a follow up request to cancel the order
  // i.e need to make sure that those requests are being issued from the same
  // user
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  // Expectation to make sure the thing is cancelled
  // i.e fetch the order that have been created out of our database, then
  // take a look at its status property and just make sure it was updated
  // to cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo('emits a order cancelled event');

import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
// Pull in the Ticket model so that we can create a ticket so we can
// associate that thing with a new order
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
  // Create a ticket
  // Since there is one ticket, I'll create a ticket directly inline rather
  // than creating a helper function
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 2000,
  });
  await ticket.save();

  // Create a cookie that encodes some particular user inside of it
  const user = global.signin();

  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a follow up request to fetch the order
  // i.e in that case, make sure that we're making those two requests as the
  // same user
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    // Make sure we set our cookie that we are making this request as a same user
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

// @ Second Test
// WE could also add in one or two tests to make sure
// * If the order is not found, return 404
// i.e for this code:
/* if (!order) { throw new NotFoundError()} */
// ...

// @ Third Test
// * or probably more importantly, if the user tries to fetch an order that
// doesn't belong to them, we send back a 401 or Not Authorized Error
// i.e for this code:
/* if (order.userId !== req.currentUser!.id) { throw new NotAuthorizedError() }; */
// i.e It would be kind of nice to make sure that one user is not able to
// fetch another user's orders
it('returns an error if one user tries to fetch another users order', async () => {
  // Create a ticket
  // Since there is one ticket, I'll create a ticket directly inline rather
  // than creating a helper function
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 2000,
  });
  await ticket.save();

  // Create a cookie that encodes some particular user inside of it
  const user = global.signin();

  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a follow up request to fetch the order
  // i.e in that case, make sure that we're making those two requests as the
  // same user
  await request(app)
    .get(`/api/orders/${order.id}`)
    // We do not want to make this request as the same user
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});

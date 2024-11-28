import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@tixvibe/common';
import { app } from '../../app';
import { Order } from '../../models/order';

// Make sure to throw an error if we try to purchase an order that doesn't
// exist
it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    // We do need a cookie on this thing using `global.signin` function because
    // we are requiring a user to be authenticated to make a request to this
    // handler using `requireAuth` middleware
    .set('Cookie', global.signin())
    .send({
      // Imaginary token
      token: 'stillhome',
      // This orderId might endup throwing some kind of error when we make a
      // query with it. We might get some kind of error from mongoose saying,
      // hey sorry but this thing is not an actual mongoDB id.
      // So rather than throwing a gibberish orderId, generate a real looking
      // id using mongoose.
      /* orderId: 'monaco', */
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

// Test to handle something where we're trying to pay for the order as a
// different user
// We dont have to create two users to test this out. We really don't.
// We really just have to create one order, save it into the DB with a
// realistic looking userId and then just make a request and try to pay for
// that order as any arbitrary user. And we'll make sure that we'll get back
// 401
it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  // Create a real order and save it to the DB
  const order = Order.build({
    // For the id, we do want this thing to look realistic
    id: new mongoose.Types.ObjectId().toHexString(),
    // userId can be any random id whatsoever but its better to make it realistic
    // just for test shake but its not important. we can have gibberish userId
    // if we want here
    userId: new mongoose.Types.ObjectId().toHexString(),
    // Hardcode the version to be 0
    version: 0,
    price: 3300,
    status: OrderStatus.Created,
  });
  // After we create the order, we'll then save it
  await order.save();

  // Now we can actually make a request and try to pay for this thing
  await request(app)
    .post('/api/payments')
    // We do need a cookie on this thing using `global.signin` function because
    // we are requiring a user to be authenticated to make a request to this
    // handler using `requireAuth` middleware
    .set('Cookie', global.signin())
    .send({
      // Imaginary token
      token: 'stillhome',
      // Instead of giving a randomly generated orderId, use id of the order
      // that was just saved to the DB above
      orderId: order.id,
    })
    // To test expectation:
    // Rather than going to `new-charge.ts` and uncommenting the 3 checks, we'll
    // try to expect a different status code. 200 lets say and that should just
    // confirm that we do infact get back a 401!
    /* .expect(200); */
    .expect(401);
});

// Test to make sure we cannot order or pay for an order after its been cancelled
it('returns a 400 when purchasing a cancelled order', async () => {});

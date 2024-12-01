import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@tixvibe/common';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';

// Redirect the import to the `stripe.ts`, and instead use the mocked version
// of `stripe.ts` located under __mocks__
jest.mock('../../stripe');

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
it('returns a 400 when purchasing a cancelled order', async () => {
  // This test is gonna be just a little bit tricky because it implies that
  // we're going to get pass the 2nd check on the `new-charge` route handler,
  // where we make sure that the person making the request is the same person
  // who originally created the order.
  // Now what that 2nd check effectively means for our second check is that,
  // when we initially create the order, we have to stick in a userId or
  // assign a userId to the order and then make a request with that same
  // userId.
  // Approach: Tweak global signin function on test setup.ts to accept an
  // optional id
  const userId = new mongoose.Types.ObjectId().toHexString();
  // Now use that above userId to build up a new order and we'll assign this
  // as the userId for the order itself!

  // Create a real order and save it to the DB
  const order = Order.build({
    // For the id, we do want this thing to look realistic
    id: new mongoose.Types.ObjectId().toHexString(),
    // Now rather than randomly generating the userId, we will provide the
    // userId that was generated above!
    userId,
    // Hardcode the version to be 0
    version: 0,
    price: 3300,
    // For the order status when we build it, we also have to update its status
    // to Cancelled cause that's what we are really trying to test out here
    // as in the it statement!
    status: OrderStatus.Cancelled,
  });
  // After we create the order, we'll then save it
  await order.save();

  // Now we can make our actual request to purchase this thing and when we
  // make the request, we'll make sure that we provide the userId that we've
  // just generated to that signin function
  await request(app)
    .post('/api/payments')
    // Very criticically, right here to the signin function, we'll pass in that
    // userId we have previously generated!
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: 'tok_visa',
    })
    .expect(400);

  // Debug
  /*
  console.log('Order before request:', await Order.findById(order.id));
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: 'tok_visa',
    });
  console.log('Response status:', response.status);
  console.log('Response body:', response.body);
  */
});

// HTTP code 204 because we're technically creating a record here
it('returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  // Now use that above userId to build up a new order and we'll assign this
  // as the userId for the order itself!

  // Create a real order and save it to the DB
  const order = Order.build({
    // For the id, we do want this thing to look realistic
    id: new mongoose.Types.ObjectId().toHexString(),
    // Now rather than randomly generating the userId, we will provide the
    // userId that was generated above!
    userId,
    // Hardcode the version to be 0
    version: 0,
    price: 3300,
    // Update the status to Created to make sure we can pay for this order
    status: OrderStatus.Created,
  });
  // After we create the order, we'll then save it
  await order.save();

  // After saving the order, then we'll make the actual request
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      // `tok_visa` is special token thats always going to work for Stripe
      // accounts that are in test mode
      token: 'tok_visa',
      // Order id is the id of the order created moment ago
      orderId: order.id,
    })
    // In this case, we expect to get a status code of 201 to indicate that a
    // payment actually was created
    .expect(201);

  // Make sure that the mock create fn was called

  // Make sure it was called with the correct arguments
  // We can take  a look at all the times it was called i.e `.calls` which
  // is gonna be an array of arrays. So we could take a look at the first
  // time it was called i.e `.calls[0]` and then for that first time, we could
  // take a look at the first argument like so i.e `.calls[0][0]`
  // console.log((stripe.charges.create as jest.Mock).mock.calls);
  // console.log((stripe.charges.create as jest.Mock).mock.calls[0][0]);
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // Now chargeOptions is going to be, back inside the route handler i.e
  // `new-charge.ts`
  // Its going to be this object
  // {
  //  currency: 'usd',
  //  amount: order.price * 100,
  //  source: token
  // }
  // So we can make sure this object has the correct properties. We can make
  // sure it has the appropriate currency, the correct amount and the the
  // correct token as well.
  // So here are three expectations to make sure all those properties are
  // set correctly.
  expect(chargeOptions.source).toEqual('tok_visa');
  // Amount we're charging should be whatever amount or price is listed on the
  // order above times 100
  expect(chargeOptions.amount).toEqual(3300 * 100);
  expect(chargeOptions.currency).toEqual('usd');
});

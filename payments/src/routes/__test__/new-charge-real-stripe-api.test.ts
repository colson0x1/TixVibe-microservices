import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@tixvibe/common';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

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
      token: 'stillhome',
    })
    .expect(400);
});

// HTTP code 204 because we're technically creating a record here
it('returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  // Now use that above userId to build up a new order and we'll assign this
  // as the userId for the order itself!

  const price = Math.floor(Math.random() * 100000);

  // Create a real order and save it to the DB
  const order = Order.build({
    // For the id, we do want this thing to look realistic
    id: new mongoose.Types.ObjectId().toHexString(),
    // Now rather than randomly generating the userId, we will provide the
    // userId that was generated above!
    userId,
    // Hardcode the version to be 0
    version: 0,
    // price: 3300,
    price,
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

  // Those expectations in the mock stripe test is assuming that we are working
  // with a mock function but now, its going to make a real reqeuest to the
  // Stripe API

  // Reach out to the Stripe API and make sure that we actually are creating
  // a charge with all the correct attributes.
  // i.e Make sure that a charge was created

  /* @ Test Approach */
  // Make a request from test file to route handler and include token and
  // orderId.
  // Route handler will create a charge requesting to the Stripe API and Stripe
  // API will send details about the charge in response back to the route
  // handler.
  // Route handler is going to respond success: true to the test file.
  // Make test file make a separate request to Stripe API after receiving a
  // success: true response back from the route handler.
  // -> Request a lit of 10 most recently charges that have been created.
  // Use currency as a unique identifier to identify a charge among the list
  // of 10 most recent charges and make it unique by randomly generating the
  // price for the order.
  // During expectation, if a charge is found in list of charges during
  // iteration with that same randomly generated amount/price, then charge
  // is successfully created inside the new-charge route handler and at no
  // point in time, theres need of change for the implementation of code
  // i.e no need to change the return value of the route handler just to
  // better suite the test.

  // The limit that we use here really just comes down to how often we expect
  // to be running multiple copies of this test suite at the same time.
  // If for some reason, we're running 10 copies of this test suite at the
  // same time, if we rely upon the default value of limit: 10, as opposed
  // to 50, then its possible that when we go to fetch our list of charges,
  // we might accidentelly push out the charts that we are looking for.
  // So by increasing this to 50, it pretty much reduces the chance of that to
  // near zero.
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  // Iterate over Stripe charges data and try to find the appropriate charge.
  // https://docs.stripe.com/api/charges/list
  const stripeCharge = stripeCharges.data.find((charge) => {
    // For every charge, iterate over each one and return true for the first
    // charge that has an amount property equal to our price times 100.
    return charge.amount === price * 100;
  });

  // Test to make sure that we create a charge with the appropriate amount
  // assigned to it
  // stripeCharge is either going to be some stripeCharge or undefined
  expect(stripeCharge).toBeDefined();
  // We could take a deeper look at the stripeCharge object and make some
  // more accersions around it. For example, we could make sure that it has
  // the appropriate currency. We can make sure that its got the correct
  // somehow inspect the token or something like that.
  // Here, just taking a look at the currency is enough!
  // It is possible for a stripeCharge to be undefined because we're using
  // `find` statement above. So ! to tell TS don't sweat it. We techincally
  // are checking to make sure that the value is defined on the line above.
  // i.e expect(stripeCharge).toBeDefined();
  // TS just doesn't really know how to interpret that line.
  expect(stripeCharge!.currency).toEqual('usd');

  // Test payment creation
  // So after we made sure that Stripe charge was actually created above,
  // we'll just take a look in our payment collection and just make sure
  // that a payment was actually created and saved with a given stripeId
  // or alternatively with the given orderId. Either one will be fine.
  const payment = await Payment.findOne({
    orderId: order.id,
    // We already checked for the existence of this variable stripeCharge
    // on: expect(stripeCharge).toBeDefined()
    // So stripeCharge!
    stripeId: stripeCharge!.id,
  });
  // Write expectation to make sure that we actually find a payment
  /* expect(payment).toBeDefined(); */
  // That above line will always evalutes successfully or truthfully
  // Because payment is either the payment we're looking for or NULL
  // And both of those are going to pass the expectation for toBeDefined()
  // because that above line is looking for a value to be undefined
  // So because payment is either going to be a payment or null, we need to
  // specifically say that we expect this thing not to be null.
  // so using the matcher `.not.toBeNull()`
  expect(payment).not.toBeNull();

  // We could either use the mock version or the Real version for Stripe.
  // Real version is a little bit slower to run but it definitely is far
  // more realistic and makes sure that our code is working as expected!
  // The other nice thing in real version here is that, we can add in a
  // different token, so maybe a completely invalid token, and we can make
  // sure that our route handler handles that in some appropriate fashion.
  // It might be kind of hard to test out an invaid token if we were mocking
  // out the API because we might not really know how to interpret a response
  // from the API or how the API is really going to respond if we give an
  // invalid token.
});

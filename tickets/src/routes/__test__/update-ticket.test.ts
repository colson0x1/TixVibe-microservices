import request from 'supertest';
import { app } from '../../app';
import { id } from './helper';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'Tomorrowland',
      price: 30,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Tomorrowland',
      price: 30,
    })
    .expect(401);
});

// Create a ticket and then update it with a different user
it('returns a 401 if the user does not own the ticket', async () => {
  // Request attempting to create a ticket
  // When we make this request, this ticket is going to be assigned some id.
  // We need to capture that id so that we can somehow make a follow up requests
  // specifying the same id
  // In short, capture the response that comes back.
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Glastonbury',
      price: '31',
    });

  // Request to edit a ticket thats been created
  // After making this request below, we're only checking to see that we get a
  // 401. If we had some pretty broken code, we might mistakenly send back a
  // 401 and still process the update anyways. So optionally we could do a
  // follow up request below the request here where we update, to retrieve
  // details about above ticket stored in response and verify that it has a
  // same title and same price. Just to make sure, the update was truly not
  // processed below.
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // Pretend that we're totally different user
    // i.e when we call global.sign() second time, we'll have new randomly
    // generated id. So as far as app is concerned, we're try to access this
    // thing as a different user
    .set('Cookie', global.signin())
    .send({
      title: 'Glastonbury Music Festival',
      price: 3500,
    })
    // The only thing we really care about here is that we get back a 401 that
    // the update gets rejected
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  // Do need to make sure ticket actually already exists

  // In this case, we want to make a request as a same user we were when we
  // created the ticket. So we're saving the reference to the cookie we're
  // generating here. So that we can pretened to be same user over
  // multiple requests.
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Glastonbury',
      price: '31',
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // Set the cookie so that we're the exact same user updating a ticket
    .set('Cookie', cookie)
    .send({
      // Invalid title
      title: '',
      // Valid price
      price: 3500,
    })
    .expect(400);
  // We can definately do a follow up request to make sure we get a 400 if
  // the title does not exist

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // Set the cookie so that we're the exact same user updating a ticket
    .set('Cookie', cookie)
    .send({
      // Valid Title
      title: 'Glastonbury Music Festival',
      price: -30,
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  // Create ticket ahead of time so that we can actually edit it
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Glastonbury',
      price: '31',
    });

  // Now let's try to edit a ticket
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // Setting the exact same cookie on this representing same user is making
    // the edit
    .set('Cookie', cookie)
    .send({
      title: 'Glastonbury Music Festival',
      price: 3100,
    })
    // Coming out of that, we're going to expect 200
    .expect(200);
  // We could be happy with the 200 OR alternatively, we could do one more
  // follow up request to try to now fetch that above ticket and write out
  // an assertion and say that thing (new title, new price) was actually updated.

  // Here, make a follow up request and just say, okay, on fetching that ticket
  // above after it's been updated, it actually has the new title and the new
  // price!
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    // We dont have to set cookies or anything like that because we do not require
    // authentication to fetch details about a single ticket
    .send();

  expect(ticketResponse.body.title).toEqual('Glastonbury Music Festival');
  expect(ticketResponse.body.price).toEqual(3100);
});

it('publishes an event', async () => {
  // @ Successfully edit or update the ticket
  // Create ticket ahead of time so that we can actually edit it
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Glastonbury',
      price: '31',
    });

  // Now let's try to edit a ticket
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // Setting the exact same cookie on this representing same user is making
    // the edit
    .set('Cookie', cookie)
    .send({
      title: 'Glastonbury Music Festival',
      price: 3100,
    })
    // Coming out of that, we're going to expect 200
    .expect(200);

  // @ Make sure publish fn got invoked
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

// Test to make sure ticket cannot be edited while its being reserved
it('rejects updates if the ticket is reserved', async () => {
  // Create a cookie so we can make a number of requests as one consistent user
  const cookie = global.signin();

  // Create a ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Glastonbury',
      price: '3100',
    });

  // In addition, in between the creation and the update, reach directly
  // into the database, get a handle on the ticket that was created and set
  // the orderId property on that thing as well
  // i.e Right after we make initial request (i.e creaeting ticket above), we
  // are then going to reach in, find our ticket and set the `orderId` property
  // on it
  // Here, id of the ticket we're looking for is inside the body of the
  // response above
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();
  // Comment and check if our test is failing as expected
  /* const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save(); */

  // Make a follow up request to edit ticket
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // Setting the exact same cookie on this representing same user is making
    // the edit
    .set('Cookie', cookie)
    .send({
      title: 'Glastonbury Music Festival',
      price: 4000,
    })
    // Expect the follow up edit to result in a 400 or essentially a bad request
    .expect(400);
});

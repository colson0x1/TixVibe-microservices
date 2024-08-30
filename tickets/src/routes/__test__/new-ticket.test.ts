import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

// Check to make sure we got authentication related stuff
it('can only be accessed if the user is signed in', async () => {
  // const response = await request(app).post('/api/tickets').send({});

  // expect(response.status).toEqual(401);

  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

  // console.log(response.status);
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      // Test for `title` provided but empty
      title: '',
      price: 25,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      // Test for no `title` provided at all
      price: 25,
    })
    .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      // Test for `price` provided but empty
      title: 'millionaire',
      price: -25,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      // Test for no `price` provided at all
      title: 'millionaire',
    })
    .expect(400);
});

// Make sure everything kind of works as expected
// If we successfully create a ticket with valid values and is authenticated,
// make sure we get status code of 201 indicating ticket was created
// i.e Write something to make sure ticket was saved to the database
it('creates a ticket with valid inputs', async () => {
  // Add in a check to make sure a ticket was saved

  // Get all the tickets that exists insode of that Ticket collection, every
  // last one
  // When this test first runs, there should be 0 collections as there's
  // logic for that in the beforeEach hook fn in the setup for JEST
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'coachella';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      // title: 'coachella',
    title,
      price: 20,
    })
    .expect(201);

  // After making the request, now we expect our collection to have exactly
  // 1 ticket inside there
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  // Look at the record that was actually created and write out an assertion
  // abuot its title and its price
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual(title);
});

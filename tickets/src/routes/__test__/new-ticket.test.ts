import request from 'supertest';
import { app } from '../../app';

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
it('creates a ticket with valid inputs', async () => {});

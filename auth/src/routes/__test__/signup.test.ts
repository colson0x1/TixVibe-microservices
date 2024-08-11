import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  // We can either return request or await it
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@google.com',
      password: 'stillhome',
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson',
      password: 'stillhome',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson',
      password: 's',
    })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@google.com',
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'stillhome',
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  // Attempt to signup same email and password combination twice in a row
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@amazon.com',
      password: 'stillhome',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@amazon.com',
      password: 'stillhome',
    })
    .expect(400);
});

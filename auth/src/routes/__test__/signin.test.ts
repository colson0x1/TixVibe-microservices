import request from 'supertest';
import { app } from '../../app';

it('fails when a email that does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'colson@google.com',
      password: 'stillhome',
    })
    .expect(400);
});

// Make sure there is actually an account to signin into
// First, go to signup route create a new account and attempt to signin with
// an incorrect password
it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@google.com',
      password: 'stillhome',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'colson@google.com',
      password: 'colson',
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@google.com',
      password: 'stillhome',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'colson@google.com',
      password: 'stillhome',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});

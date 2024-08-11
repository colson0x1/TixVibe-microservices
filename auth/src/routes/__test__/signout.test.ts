import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@google.com',
      password: 'stillhome',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  // console.log(response.get('Set-Cookie'));

  const cookies = response.get('Set-Cookie');
  expect(cookies?.[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
  );
});

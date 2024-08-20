import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
  const authResponse = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@google.com',
      password: 'stillhome',
    })
    .expect(201);
  // Pulling off that authentication cookie which contains JWT inside of it
  // and including it on the follow up requests setting the headers of the
  // request so that it works smoothly in the supertest environement
  const cookie = authResponse.get('Set-Cookie') as string[];

  // We get back cookie from the first request above
  // But cookies are not included in the followup request:wa
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  // console.log(response.body);

  expect(response.body.currentUser.email).toEqual('colson@google.com');
});

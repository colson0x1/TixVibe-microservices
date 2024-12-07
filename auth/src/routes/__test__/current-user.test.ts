import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
  /* const authResponse = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'colson@google.com',
      password: 'stillhome',
    })
    .expect(201);
  // Pulling off that authentication cookie which contains JWT inside of it
  // and including it on the follow up requests setting the headers of the
  // request so that it works smoothly in the supertest environement
  const cookie = authResponse.get('Set-Cookie') as string[]; */

  const cookie = await global.signin();

  // We get back cookie from the first request above
  // But cookies are not included in the followup request:wa
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    // .expect(200);
    // Make a change to this TEST to make a breaking change so that its
    // reflected on the PR
    // This will cause our test suite to fail
    // + Imagine that maybe along with this failing test, we also wrote out
    // some other code inside of our project that we would want to eventually
    // deploy
    /* .expect(400); */
    .expect(200);

  // console.log(response.body);

  expect(response.body.currentUser.email).toEqual('colson@google.com');
});

// Make unauthenitcated requests i.e no cookie
it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentUser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});

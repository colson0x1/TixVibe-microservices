import request from 'supertest';
import { app } from '../../app';

it('returns a 404 if the ticket is not found', async () => {
  await request(app).get('/api/tickets/tomorrowland').send().expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  // Approach 1
  // Attemtpt to access the Ticket model directly from inside this test and
  // build with some data and save it
  // Ticket.build({})
  // Ticket.save()

  // Approach 2
  // Make a request to build the ticket on the fly
  // So we can make a request to create a ticket and then attempt to fetch it
  // right after.
  // This method is cool because it really simulates us using our API directly!
  // But approach 1 is better in the context that we've test here that is testing
  // some other code that we're not directly trying to test
  // But option 2 kind of represents the reality a little bit more
  const title = 'concert';
  const price = 25;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

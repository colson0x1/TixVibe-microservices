import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  /* return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'Tomorrowland',
    price: 30,
  }); */
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title,
    price,
  });
};

it('can fetch a list of tickets', async () => {
  /* await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'tomorrowland',
    price: 30,
  });

  await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'coachella',
    price: 28,
  }); */

  await createTicket('Tomorrowland', 30);
  await createTicket('Coachella', 28);
  await createTicket('Lollapalooza', 27);

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});

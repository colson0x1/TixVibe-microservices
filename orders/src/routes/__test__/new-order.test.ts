import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

// Test for auth
// Test for body validation i.e provide some valid id for the ticket id in
// the body of the request (valid id here means valid mongo db object id)

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {});

it('reserves a ticket', async () => {});

import express, { Request, Response } from 'express';
import { NotFoundError } from '@tixvibe/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  // findById is a query helper build directly into our Model and it just
  // tries to find a particular record
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    // NotFoundError is specifically built to handle the case in which we
    // make a request and try to find something that just does not exist
    throw new NotFoundError();
  }

  // If ticket is found, send ticket on the response
  // NOTE: Whenever we leave off status code, it will default to 200 ok
  res.send(ticket);
});

export { router as showTicketRouter };

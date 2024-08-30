import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  // The empty object on find is usually used for filtering if we want to have
  // any kind of conditions on what records we actually find.
  // We're putting in an empty object here to say, just give us all the
  // tickets inside this collection
  const tickets = await Ticket.find({});

  res.send(tickets);
});

export { router as indexTicketRouter };

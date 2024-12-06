import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  // The empty object on find is usually used for filtering if we want to have
  // any kind of conditions on what records we actually find.
  // We're putting in an empty object here to say, just give us all the
  // tickets inside this collection
  // const tickets = await Ticket.find({});
  // NOTE: It is the presence of the orderId property that indicates that a
  // ticket is currently reserved and cannot be ordered.
  // Only get tickets whose orderId property is not defined
  const tickets = await Ticket.find({
    // Find all of the tickets that don't have corresponding order
    orderId: undefined,
  });

  res.send(tickets);
});

export { router as indexTicketRouter };

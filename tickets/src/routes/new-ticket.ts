import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@tixvibe/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // res.sendStatus(200);
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      // We have access to currentUser on the req object, because currentUser
      // middleware is executed back inside of the app.ts. That's what sets the
      // req.currentUser property
      // We have to make sure currentUser actually exists
      // We don't really have to do that because requireAuth middleware above,
      // already does that for us. Inside there is a check to see if currentUser
      // is defined, if not it throws NotAuthorizedError and we never continue on
      // to the next middleware or possibly the next request handler in this case
      // So, right now we're never going to end up in this statement right here
      // if currentUser is undefined. TypeScript just doesn't understand that
      // because it is not looking into the requireAuth middleware fn and understanding
      // that we're going to return early out of this entire chain if currentUser
      // isn't defined
      // So we're very confident about the `!` and tell TS, don't sweat it,
      // currentUser is defined!
      userId: req.currentUser!.id,
    });
    await ticket.save();
    // Right after ticket.save() call, publish an event
    // Note: We need to pass in active NATS client when we call this
    // + This is an Asynchronous call
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      // `title: title` OR title: `ticket.title`
      // Note: With Mongoose, we can implement some pre and post save hooks
      // i.e we can do some validation or sanitization on these values so
      // the value that came in off the `req.body` is not necessarily the same
      // as what actually got saved to the database
      // So it is recommended to pulling the title or all these relevant attributes
      // directly off of the ticket that was saved to the database as opposed to
      // pulling the title and price off of the `req.body` because they might
      // actually be different values
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  },
);

export { router as createTicketRouter };

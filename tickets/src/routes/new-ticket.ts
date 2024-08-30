import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@tixvibe/common';
import { Ticket } from '../models/ticket';

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

    res.status(201).send(ticket);
  },
);

export { router as createTicketRouter };

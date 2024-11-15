import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@tixvibe/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // Pull the ticket user is looking for out of Ticket collection
    const ticket = await Ticket.findById(req.params.id);

    // If there is not a ticket with that id, throw not authorized error
    if (!ticket) {
      throw new NotFoundError();
    }

    /*  We have now got this entire ability throug these two listeners
     *  (order-cancelled-listener & order-created-listener) to somehow
     *  lock down a ticket and then unlock it later on.
     *  But at no point do we actually implement any logic to prevent a user
     *  from editing a ticket that is currently locked down
     *  -> Add a simple change inside of router file for the update-ticket route
     *  and make sure that if a ticket is locked down, tell user sorry that you
     *  cant update this thing */
    // So right after we find the ticket (i.e above if statement) and it can
    // be right before (i.e below if statement) or after (i.e below if statement),
    // we take a look at who owns the ticket. Just somewhere inside of here,
    // we need to decide whether or not we should allow the ticket to be
    // edited in case it is actually reserved!
    // So right after we find the ticket, we decide if the order is reserved
    // or not in the presence of the `orderId`. If it contains `orderId`
    // then ticket is reserved else it is unreserved.
    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    // Found ticket successfully
    // Check and make sure whoever is making this request, it has the same
    // id as the user id saved on a ticket
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // Passing that above expression means, User now own the ticket so apply
    // the update
    // To apply the update, we can use the set command on the Ticket document
    // that we already fetched. Whenever we call set, we can pass it in an
    // object that contains properties we want to update this thing to.
    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    // After setting some new properties on the ticket, that just makes updates
    // to the documemt in memory. It doesn't actually persist those updates
    // back to our MongoDB database. So we have to await  and save and that's going
    // to persist everything back.
    await ticket.save();
    // NOTE: After we call save, those updates will be persisted to the database.
    // And Mongoose is going to make sure that any further updates either due
    // to some post save hooks, pre save hooks, something done by MongoDB itself
    // or whatever else, all other possible updates will be persisted back to
    // this Ticket document that we already have a reference to.
    // So we do not have to say refetch that ticket above to get the updated
    // version that's been saved. We already have the updated version right here
    // in this ticket document! So we can continue to rely upon res.send to
    // send back details about this updated ticket!

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  },
);

export { router as updateTicketRouter };

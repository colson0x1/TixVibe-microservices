import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@tixvibe/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      // Subtle service coupling
      // Make sure user is providing a valid Mongo ID
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  // If anything goes wrong with the validation step, we reject the request
  // right away and send back an error message with validateRequest middleware
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    // handle the case in which no ticket was found
    if (!ticket) {
      // If we throw this custom NotFoundError, error handling middleware will
      // automatically capture it, turn a response into 404 and send it back
      // to the user
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    // Run query to look at all orders. Find an order where the ticket is the
    // ticket we just found *and* the orders status is *not* cancelled.
    // If we find an order from that means the ticket *is* reserved
    // i.e This query is going to try to find an order already existing inside
    // of our database that is taking a look at the ticket we just found
    // and has a status that is Created, AwaitingPayment or Complete
    // And if we find the ticket that meets those all crietria, that means the
    // ticket is already reserved and the user who is making this request cannot
    // attempt to reserve the ticket they're trying to reserve!
    /*
    const existingOrder = await Order.findOne({
      ticket: ticket,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
        ],
      },
    });
    // If we find an `existingOrder`, that means this ticket is already reserved
    // and we want to return early from this route handler
    if (existingOrder) {
      throw new BadRequestError('Ticket is already reserved');
    }
*/
    // This refactor for above logic is lot easier to read.
    // Its not really as clear what it means to be reserved so the comment
    // being right above doesn't make lot of sense so the comments above
    // should be moved over to Model file to make lot of sense
    // But this right here is a lot easier to understand whats going on!
    // We've got a very well named method thats going to tell us with a simple
    // boolean if a ticket is reserved or not!
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    //  Calculate an expiration date for this order

    // Build the order and save it to the database

    // Publish an event saying that an order was created
    res.send({});
  },
);

export { router as newOrderRouter };

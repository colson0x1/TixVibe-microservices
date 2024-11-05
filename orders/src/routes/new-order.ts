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
import { OrderCreatedPublisher } from '../events/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// Number of seconds before the order expires
// i.e The window of time user has to pay for this order
// This is very important setting that dramatically affects how our application
// behaves and how long user has to purchase the ticket so we might want to
// extract this even further to ENVIRONMENT VARIABLES which would allow us to
// make changes to this window of time without having to redeploy the entire
// application!!
// We can instead just update the value inside of our Kubernetes config file
// inside the infra dir
// Alternatively, we could even get fancier than that and try to save this
// number of seconds as a record to the database and then put together some
// kind of web UI that would allow an administrator to change it on the fly.
// We might even want to have some kind of per user expiration settings.
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

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
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      // We're already doing a check to make suer currentUser is defined
      // with `requireAuth` middleware so we can use ! to force TS not to worry
      userId: req.currentUser!.id,
      // Created is the initial status that all orders are going to get
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    // After building the order, Save it to the database
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      // At code level, expiresAt is a date object inside this file.
      // Eventually the date object there is going to converted to string
      // by Mongoose before it gets saved to MongoDB
      // Here we are goint to provide `expiresAt` as a string because whatever
      // object we put inside this `publish()` is going to be eventually turned
      // into JSON
      // Whenever we put Date object here, its converted to string with
      // timezone like '02152025:KTM'
      // Whenever we share timestamp across different services, we want to
      // communicate them in some kind of timezone agnostic sort of way. So
      // ideally, we would be providing a UTC timestamp which is giong to work
      // regardless of what the time zone of the service that is receiving
      // this event is in.
      // So rather than relying upon the deafult toString behavior of the
      // Date object which would end up with the not timezone that we want,
      // we are going to instead controll how this thing gets turned into a
      // string. So we are going to provide here toISOString()
      // That will give us a UTC timestamp/timezone!
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    // res.send({});

    res.status(201).send(order);
  },
);

export { router as newOrderRouter };

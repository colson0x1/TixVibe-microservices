import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from '@tixvibe/common';
import { Order } from '../models/order';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    // TODO: Add some validation step to make sure the params right there
    // i.e `orderId` is the accurate or what looks like a valid mongodb id

    // Find this order `orderId` and also
    // Simultaneously retrieve the associated ticket as well
    // i.e Get Order and the associated ticket
    const order = await Order.findById(req.params.orderId).populate('ticket');

    // Its possible that we don't find the order
    // If we don't find the order, throw error
    if (!order) {
      throw new NotFoundError();
    }

    // If the user doesn't own this order, throw error
    // i.e One user cannot look at another user's orders
    // So if the person who owns this order is not equal to the id of the person
    // making the request, thror error
    // ! property is important on currentUser because we want to tell TS that
    // don't worry, we already made sure that there is a `currentUser` property
    // i.e through `requireAuth` middleware
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // res.send({});
    // If both of the above checks are passed, then we find the order and we
    // actually want to send this back to the user!
    res.send(order);
  },
);

export { router as showOrderRouter };

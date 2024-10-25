import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotAuthorizedError,
  NotFoundError,
} from '@tixvibe/common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// We are not really deleting a request, we're canceling it
// It's better to use `patch` instead of `delete` here!!
router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    // const order = await Order.findById(orderId);
    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    // if owner of the order is not equal to user who is making the request, then
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // Update our order status
    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publishing an event saying this was cancelled!
    new OrderCancelledPublisher(natsWrapper.client).publish({
      // On this object, provide some information for the events data
      id: order.id,
      ticket: {
        // id for ticket is tricky here
        // We don't have a reference to the ticket that is associated to this
        // order on this route handler and we did not even loaded up, when we
        // fetched this order from the database above
        // i.e `const order = await Order.findById(orderId);`
        // So we don't really know the id of the ticket to put inside of here
        // right now
        // So to fix that up, we're going to find where we make a query on the
        // database and we're going to make sure that we populate that
        // ticket property
        // i.e `const order = await Order.findById(orderId).populate('ticket');`
        // So now when we fetch the order, we will also get the associated
        // ticket along with it!
        // So now if we wanted to, we could access using `order?.ticket`, that
        // would give us ticket that we were looking for so in theory we could
        // get the ID of that ticket by doing `order?.ticket.id`
        id: order.ticket.id,
      },
    });

    // res.send(order);
    // If we're really deleting this request, we need to also pass .status(204)
    res.status(204).send(order);
  },
);

export { router as deleteOrderRouter };

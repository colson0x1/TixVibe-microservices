import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotAuthorizedError,
  NotFoundError,
} from '@tixvibe/common';
import { Order, OrderStatus } from '../models/order';

const router = express.Router();

// We are not really deleting a request, we're canceling it
// It's better to use `patch` instead of `delete` here!!
router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

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

    // res.send(order);
    // If we're really deleting this request, we need to also pass .status(204)
    res.status(204).send(order);
  },
);

export { router as deleteOrderRouter };

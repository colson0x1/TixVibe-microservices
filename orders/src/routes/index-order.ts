import express, { Request, Response } from 'express';
import { requireAuth } from '@tixvibe/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    // ! because we already made sure the user is authenticated through
    // `requireAuth` middleware
    userId: req.currentUser!.id,
  }).populate('ticket');

  res.send(orders);
});

export { router as indexOrderRouter };

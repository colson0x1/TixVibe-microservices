import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@tixvibe/common';
import { stripe } from '../stripe';
import { Order } from '../models/order';
import { Payment } from '../models/payment';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    // res.send({ success: true });
    const { token, orderId } = req.body;

    // Find the appropriate order out of the DB
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    // Check and see if the user who is trying to pay for this thing has
    // the same order id as the order's user id property above
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    // Make sure oder is not cancelled
    if (order.status === OrderStatus.Cancelled) {
      // Whenever we throw BadRequestError, we also have to provide a reason
      // to say yeah here's why you made a bad request
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    // If we get pass those three checks above, then we'll say okay fine, you
    // can pay for this thing, we'll try to actually build your credit card!
    // TO make sure these three checks works, we should do a little quick
    // intermediate test here.
    // Now in theory, we can test this out and try to make a variety of requests
    // using Postman like try to pay for an order that doesn't actually exist,
    // we could try to signup as two different users and create an order by one
    // and pay from another,
    // we could also try to create an order, wait a minute for that thing to be
    // expired and then try to pay for it
    // Using automated test can make sure that we are doing the correct thing
    // in all those 3 scenarios.
    // + Its hectic with Postman to test all of these but its ease with
    // automated tests

    // @ Uncomment this code below where we create the charge to TEST the
    // test fail. This ensures that now we are not creating a charge at all
    // and that means when we try to go and get our list of most recent
    /*
    // charges, we should not find one with the appropriate price.
    // Create a charge and bill user for some amount of money
    await stripe.charges.create({
      currency: 'usd',
      // We need to convert $ into cents for the amount
      amount: order.price * 100,
      // We also need to provide source for this charge i.e where the money
      // is gonna come from. And that's gonna be a token that is incoming
      // into our request handler!
      source: token,
    });
    */
    // Create a charge and bill user for some amount of money
    const charge = await stripe.charges.create({
      currency: 'usd',
      // We need to convert $ into cents for the amount
      amount: order.price * 100,
      // We also need to provide source for this charge i.e where the money
      // is gonna come from. And that's gonna be a token that is incoming
      // into our request handler!
      source: token,
    });
    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    // Above resolution works fine!
    // Error: StripeInvalidRequestError: You cannot accept payments using
    // this API as it is no longer supported!
    // New updates docs!!
    // https://stripe.com/docs/payments/payment-intents
    // For real Stripe TEST (i.e if not using mock version), slight different
    // changes has to be made.
    // Also, we don't put anymore the token but only the `orderId`
    // {
    //    orderId: 'a98sdjosd0sdsoks09sjoka9'
    // }
    // Which then will work in Postman!
    // {
    //    "success": true
    // }
    /*
    await stripe.paymentIntents.create({
      currency: 'usd',
      // We need to convert $ into cents for the amount
      amount: order.price * 100,
      // We also need to provide source for this charge i.e where the money
      // is gonna come from. And that's gonna be a token that is incoming
      // into our request handler!
      payment_method_types: ['card'],
    });
    */
    res.status(201).send({ success: true });
  },
);

export { router as createChargeRouter };

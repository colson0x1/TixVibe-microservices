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
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

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
    // payment record relates charge and order together
    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    // Uncomment to test payment creation
    /* await payment.save(); */
    await payment.save();
    // If we await this, then we're going to make sure that we await to publish
    // the event before we send a response back.
    /* await new PaymentCreatedPublisher(natsWrapper.client).publish({ */
    // Alternatively, we could remove the await and just say, hey, let's just
    // send back a response as soon as possible and we're not going to worry
    // about handling or waiting for the event to be published.
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      // For orderId, we could direct use the `orderId` destructured from the
      // `req.body` but for best practices, we really like to take information
      // directly off of the record i.e payment defined above, that we just
      // saved instead. Because who knows, we might be making some adjustment
      // to the orderId, we might be changing it in some fashion. Same with
      // the stripeId. Obviously I'm not doing above but its usually just
      // best practice to take information off the record we just saved
      // because we don't know if there's something kind of massaging that
      // information before it actually gets stored inside the database.
      // So for the orderId, we're going to use payment.orderId
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    // Return some meaningful data than just a success: true, like maybe
    // the entire payment object or maybe just the payment object id.
    // Really in this case, just about any return value is totally fine
    // because we're not really gonna make use of this information at any
    // point in time inside of our React application.
    // So for now, I'm just returning the id of the payment that was created.
    /* res.status(201).send({ success: true }); */
    res.status(201).send({ id: payment.id });
    // We could also write a test around the above line and make sure that the
    // id that is being sent back is the same as the payment that was actually
    // saved to the database.

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
    /* res.status(201).send({ success: true }); */
  },
);

export { router as createChargeRouter };

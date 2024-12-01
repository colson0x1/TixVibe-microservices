import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from '@tixvibe/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    // Take a look at the orders collections and find the relevent order
    /* const order = await Order.findById(data.orderId); */
    // When we initially fetched our order like above, we did not try to
    // populate that ref. WE are relating an order and a ticket together through
    // that ref system. So if we want to make sure that we get our order or
    // fetch this order and also load up the associated ticket, we do have to
    // chain on `.populate` statement and put in `ticket` like so.
    const order = await Order.findById(data.orderId).populate('ticket');

    // Check if order is defined
    if (!order) {
      throw new Error('Order not found');
    }

    // Right now, whenever we receive a message (i.e msg), we're going to
    // find the corresponding order no matter what
    // (i.e const order = await Order.findById(...))
    // and always mark the order as being cancelled below.
    // And as we can imagine, there might be a kind of big downside to this.
    // Like what would happen if we received a cancellation event around an
    // order that has already been paid for.
    // Well, chances are we would take this order that has already been paid
    // for or be marked as complete and cancel it anyways.
    // So we do have to add in a little check here and just make sure that
    // we do not try to cancel an order that has been paid for right after
    // our little check above to make sure that we have an order.
    // So here, we will say that if order status property is equal to complete,
    // then lets just return early and ack the message because we do not wanna
    // do anything with this cancellation event.
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    // Update the status
    order.set({
      status: OrderStatus.Cancelled,
      // The order is going to contain a reference directly to the ticket that
      // it is reserving. So we need to kind of make a decision here and decide
      // whether or not we want to clear out that reference. So in another words
      // whether we want to say ticket is something like NULL
      // i.e ticket: null
      // As soon as the order goes to the cancelled state, the ticket that is
      // associated with it is going to be considered to be no longer reserved.
      // i.e isReserved fn on models/ticket.ts
      // So its not needed to reset or clear out the ticket property.
      // That's actually a good thing because once an order is cancelled, a
      // user can still see what ticket it had been associated with.
      // If `ticket` was set to `null`, a user would then try to look at all
      // their different orders and we would not have any idea what any given
      // cancelled order was for i.e what they were trying to buy. So if we
      // reset the ticket property, there would be no tie between this order
      // and a given ticket anymore. So a user might just see, hey, you've
      // got like five cancelled orders, but they'd be sitting there wondering,
      // what were these orders for? I dont have any information.
      // And so it's pretty convenient that we decide our `isReserved` fn to
      // allow us to have a cancelled status.
      // So not including `ticket: null`
    });
    // After seeting that status, save the order
    await order.save();
    // Inform the rest of the world, all of our different services, that
    // this order has now been cancelled!
    // i.e publish an event right away saying that this order has been cancelled
    // NATS client is already a instance property of our class so it
    // can be used as `this.client`
    // i.e listener -> this.client
    // `await` is needed infront of publishing event because just to make sure
    // we wait for this thing to be published before finally acking or
    // acknowledging the overall message.
    await new OrderCancelledPublisher(this.client).publish({
      // id of the order that's being cancelled
      id: order.id,
      // version for concurrency issues
      version: order.version,
      // reference to the ticket i.e id of the ticket that this order was
      // associated with
      ticket: {
        id: order.ticket.id,
      },
    });

    // Ack the message
    msg.ack();
  }
}

import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@tixvibe/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    // Take a look at the orders collection inside of Orders Service. Make
    // sure to update the order status to paid or complete or whatever that
    // status was.
    // i.e First take a look at all of our different orders and try to find
    // the appropriate order i.e. the one that we just paid for.
    const order = await Order.findById(data.orderId);

    // Do a quick check just to make sure that we actually found the correct
    // order
    if (!order) {
      throw new Error('Order not found');
    }

    // Otherwise, update the status of the order and then save it.
    order.set({
      status: OrderStatus.Complete,
    });
    // Here, we're making a change to our order and we're saving it. Every
    // single time we make a save or make a change, thats going to increment
    // the version number.
    // And if we ever make change and increment that version number without
    // emitting an event, that means that any time we emit a further event
    // around this order, we might have some missing versions for all of our
    // other dependent services.
    // So ideally in this scenario, we would have an additional event type
    // inside of our app, something to just do something like, order:updated
    // or something very similar to that. That would definitely be ideal.
    // But in the context of my application, once an order goes into the
    // complete status, that's pretty it. Order is complete. Its never going
    // to be updated again. So although we really technically should emit or
    // publish event here, just saying that this thing has been updated just
    // because I don't expect any other service to ever try to update an
    // order after this or to make any further changes. So I'm going to leave
    // it to just saving the order and not publsing an event after it.
    // But if we want to, we can create a new event type of order:updated and
    // tell everyone else in the world or all of our other services that the
    // order has been updated.
    await order.save();

    // Naturally, we're gonna make sure we ack the message.
    msg.ack();
  }
}

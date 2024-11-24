import {
  OrderCancelledEvent,
  Subjects,
  Listener,
  OrderStatus,
} from '@tixvibe/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queue-group-name';
import { Order } from '../../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Take a look in our collection of orders, we are going to try to find
    // some order with a given id, and the appropriate version number as well
    // and we're going to update its status to cancel. That's pretty much all
    // we have to do.
    // We are using findOne here because when we make this query, we want to
    // find a record with a appropriate id, so the id that is listed inside
    // the data object and the appropriate version as well just to make sure
    // we're processing all these events in the correct order.
    const order = await Order.findOne({
      // Now, with the order itself, it doesn't really make a big difference
      // to worry about the version too much, because around in order, all
      // we reallly have is the order:created and the order:cancelled. That is
      // it. There's not really any ordering of events per say, because if we
      // fail to find the order at all, that means, we probably have not
      // correctly processed that create order event just yet. And if we find
      // the correct order, it doesn't really matter what the version is,
      // because there's never ever going to be any intermediate update events
      // inside there either. So we don't strictly need the version thing this
      // time around, but we're going to include it anyways just to possibly
      // prepare our code for some particular new event that we might introduce
      // into our app at some point in time in the future of something like
      // maybe order updated or something like that. So if we ever had some
      // kind of update event, that's when the version starts to get really
      // important. So here is the coed that's just going to assume possibly
      // at some future point in time, we might have the ability to update
      // and order.
      _id: data.id,
      version: data.version - 1,
    });
    // We can extract that findOne helper method into a separate function
    // inside of our model file itself if we like, like in Orers Service.

    // Make sure we did find an order
    if (!order) {
      throw new Error('Order not found');
    }

    // Otherwise update the status of the order manually
    order.set({ status: OrderStatus.Cancelled });
    // Save the order
    await order.save();

    // ack the message
    msg.ack();
  }
}

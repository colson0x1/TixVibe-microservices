import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from '@tixvibe/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    // Take a look at the orders collections and find the relevent order
    const order = await Order.findById(data.orderId);

    // Check if order is defined
    if (!order) {
      throw new Error('Order not found');
    }

    // Update the status
    order.set({
      status: OrderStatus.Cancelled,
      // The order is going to contain a reference directly to the ticket that
      // it is reserving. So we need to kind of make a decision here and decide
      // whether or not we want to clear out that reference. So in another words
      // whether we want to say ticket is something like NULL
      // i.e ticket: null
    });
  }
}

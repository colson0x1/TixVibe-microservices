/* @ Replication of data between the services */
// NOTE: We shouldn't extract this code inside of common lib and use it on
// both the Ticket Service and Order Service because, THIS right here is the
// implementation or essentially code to save data to the database and this
// could potentially be very specific to the service we're working!
// For example, this Ticket model inside of Order Service is going to have
// attributes inside of here that are just attributes that the Order service
// alone needs to work correctly. i.e There might be tremendous number of
// additional pieces of information tied to a ticket that gets saved inside of
// the Ticket service. But the Order service doesn't care about all those
// additional properties that may or may not exist. The Order Service here
// only cares about title, price, version and ID of the ticket.
// That's it! Nothing else.
// So we definitely want to have different definitions of what a ticket is
// between Order and Ticket Services. Beyond that, this Order service might
// eventually grow to encapsulate things that can be a order or purchase besides
// just tickets like parking spots/parking pass for some sporting event like that.
// We would probably want to encapsulate that logic under this Order service as
// well and allow user to order a parking pass. But a parking pass might have a
// very different set of attributes than a ticket. So we would not want to
// essentially lock down the definition of what a ticket is between the Order
// service and the Ticket service. And that's why we're definitely going to make
// sure that we do not try to share the definition of exactly what a ticket is
// as it gets saved to the database between these different services.

import mongoose from 'mongoose';
// import { OrderStatus } from '@tixvibe/common';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

// `statics` object is how we add a new method directly to the Ticket model itself
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};
// Add a method directly to a Ticket document itself
// Example usecase:
// `const isReserved = await ticket.isReserved();`
// Use function keyword instead of arrow func because of Mongoose, the way its
// written, its kind of stuck in the old ways of writing JavaScript
// So in order to actually get information about the Ticket document that we're
// operating on, when we call this method `isReserved()`, we're goint to access
// `this`. So inside this function, `this` is equal to the ticket document
// that we just called `isReserved` on!
// i.e `const isReserved = await ticket.isReserved()`
// The value of `this` inside of that function is going to be equal to that
// `ticket` document that we just inside the database a moment ago.
// In simple, its going to mess around the value of `this` if we dont use
// function keyword
ticketSchema.methods.isReserved = async function () {
  // @ Query to determine whether or not a given ticket is already reserved!
  // Make sure that this ticket is not already reserved
  // Run query to look at all orders. Find an order where the ticket is the
  // ticket we just found *and* the orders status is *not* cancelled.
  // If we find an order from that means the ticket *is* reserved
  // i.e This query is going to try to find an order already existing inside
  // of our database that is taking a look at the ticket we just found
  // and has a status that is Created, AwaitingPayment or Complete
  // And if we find the ticket that meets those all crietria, that means the
  // ticket is already reserved and the user who is making this request cannot
  // attempt to reserve the ticket they're trying to reserve!
  const existingOrder = await Order.findOne({
    // Now inside of this `isReserved` fn, the `ticket` document we're trying
    // to look for is going to equal to `this` inside of this fn
    // ticket: ticket,
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  // converting null to return boolean
  return !!existingOrder;
};

// Define the actual Model
// 'Ticket' is a collection
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };

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
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
// import { OrderStatus } from '@tixvibe/common';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  // Make TS don't complain when version is accessed as `ticket.version`
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  // Add in a new query method directely to this model itself thats going to
  // just facilitate us in doing a query for a `id` plus a `version`
  // Better method name: @ findByIdAndPreviousVersion
  // For ease, I've renamed it to: @ findByEvent
  // The assumption here is that, I'm going to pass some kind of event or
  // data object. And this method, will pull off the `id` and `version`
  // properties, subtract 1 from the version and use that to run the same
  // query that is there before
  // And to actually implement this method, we have to add a function to
  // the `statics` object
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
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

ticketSchema.set('versionKey', 'version');
// ticketSchema.plugin(updateIfCurrentPlugin);

// Not using mongoose-update-if-curernt plugin and using vanilla Mongoose to
// achieve the same logic
// Inject some additional criteria on the query that is issued when we try to
// update a record
// i.e make sure whenever we write some record to the DB, make sure that
// we are writing to the correct record i.e record with correct id and version
// 'pre' save hook is a middleware thats going to run anytime we try to save
// a record
// Here inside the hook, we're gonna make sure that we provide the function with
// the `function` keyword because like many other middlewares in Mongoose,
// the value of the document that we're trying to save is available inside
// this function as `this`. And if we use an arrow function here, that would
// override the value of `this` inside the function, and all of a sudden things
// would not work as expected
// We must make use of the `function` keyword
// This prehook fn is also going to receive a single argument of `done`.
// `done` is a callback fn that we've to manually invoke once we've done
// everything we intend to do inside of this middleware
ticketSchema.pre('save', function (done) {
  // Tell TS that $where exists so manually ignoring type checking
  // On latest version of mongoose, the type definition of Mongoose contains
  // the $where so ts-ignore is not needed
  // @ts-ignore
  this.$where = {
    version: this.get('version') - 1,
  };
  // Now, when we reach out to mongodb to save this record, we are not only
  // gonna say, try to find a record with some appropriate id but also a
  // version equal to the current version - 1
  // If we're incrementing our version by 100, then it would be -100 instead

  done();
});

// Actual implementation in the `statics` object
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  // Run the same query that is inside the listener ticket-created-listener
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

// `statics` object is how we add a new method directly to the Ticket model itself
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  /* return new Ticket(attrs); */
  // Convert the `id` property from ticket that was converted to
  // `id` from `_id` in JSON while transmitting the event, do convert
  // the `id` to `_id` from event data so that it will be saved as `_id`
  // in the local ticket collection of Orders Service in `models/ticket.ts`
  // ie. Rather than passing the entire `attrs` object and just allowing it to
  // assign the ID property, we're going to instead assign all these properties
  // one by one and as we do, we're going to rename the `_id`
  // BTW, this manual method is not super idea now because now we're relying
  // upon listing out each property in great deatail
  // In another words, if we start to add some different properties to the
  //`TicketAttrs` interface, we're going to also have to come down to this
  // `build` method and make sure we assign these properties through as well
  // And so that's just a little bit of techinical debt
  return new Ticket({
    // rename `id` to `_id`
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
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

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

interface TicketAttrs {
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
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

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

// Define the actual Model
// 'Ticket' is a collection
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };

import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// Properties that are required ti build a new Ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// Properties that a Ticket has
// The only purpose of this thing is to have the possibility of adding in
// some additional properties in the future
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  // Make TS understand that an instance of a Ticket has a version property
  // i.e now we can write `ticket.version` without TS complaining at us
  version: number;
  orderId?: string;
}

// Properties tied to the Model
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
    },
    userId: {
      type: String,
      required: true,
    },
    // Add in the idea of a `orderId` being tied to a ticket
    orderId: {
      type: String,
      // We are not going to mark it as being required because when a ticket is
      // first created, there is not going to be any order associated with it
    },
  },
  {
    // Massage that id property
    toJSON: {
      transform(doc, ret) {
        // ret is gonna be the object thats just about to turned into JSON
        // So we're going to make a direct changes to that ret object
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

// Right after the Ticket schema defination, add in two lines of configurations

// Tell mongoose to track the version of all these different documents using
// the field `version` instead of default `__v`
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// This is going to be the one and only way that we create new records!
// Just to make sure we can have TS helping us figure out the different
// types of attributes we're supposed to providing.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };

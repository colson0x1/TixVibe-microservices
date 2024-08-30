import mongoose from 'mongoose';

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

// This is going to be the one and only way that we create new records!
// Just to make sure we can have TS helping us figure out the different
// types of attributes we're supposed to providing.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };

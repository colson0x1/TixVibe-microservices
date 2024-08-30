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

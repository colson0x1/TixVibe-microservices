import mongoose from 'mongoose';
import { OrderStatus } from '@tixvibe/common';
import { TicketDoc } from './ticket';

export { OrderStatus };

// Properties that are required to create an Order
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  // ticket is an instance of TicketDoc
  ticket: TicketDoc;
}

// Interface about instance of an Order
// Properties that actually end up on an Order
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  // ticket is an instance of TicketDoc
  ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  // All we are saying is, this Model (i.e Collection) has one extra little
  // method called `build()` for type checking when create an Order Document
  // Its gonna take an argument called `attrs` that is of type `OrderAttrs`
  // and out of that, we'll get an `OrderDoc`
  build(attrs: OrderAttrs): OrderDoc;
}

// Schema that actually describes the different properties and rules about them
// that we're gonna have on an instance of an Order
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      // Make sure every order that gets created has a user tied to it
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
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

// Define `build` method on the Order Schema static's object which is going
// to give us the build method on the actual Order model
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

// `model` is a generic fn
// 'Order' is the name of the collection
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };

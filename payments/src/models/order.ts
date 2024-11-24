import mongoose from 'mongoose';
import { OrderStatus } from '@tixvibe/common';

// List of properties that we need to provide when building an order
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// List of properties that an oder has
interface OrderDoc extends mongoose.Document {
  // `OrderDoc` is gonna look absolutely identical in nature to `OrderAttrs`
  // except we're not gonna list out the `id` here.
  // We only list `id` inside the `OrderAttrs` to say that whenever we want
  // to create an order, we must provide an `id`
  // But when we write out the `OrderDoc`, the `mongoose.Document` interface
  // that we are extending already includes or defines the idea of a `id`
  // property. So we do not have to relist it down inside this `OrderDoc`
  // interface as it is essentially already listed inside of that interface.
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// List of properties that the model itself contains
// So this is gonna list out any custom method we add to the overall collection
// This thing will have a build method. Its going to take in some object of
// type `OrderAttrs` and then return an instance of an `OrderDoc`
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    // List out all the different properties and its going to be roughly be the
    // same as listed on the OrderDoc
    // The only big difference is we're not going to include the version because
    // the version property is going to be maintained automatically by the
    // mongoose-update-if-current module which will eventually install and wire
    // up to this document
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // We can use a little trick to make sure that the value of satus we provided
    // was one of the values inside of the Order enum as well like in Orders
    // Service
    status: {
      type: String,
      required: true,
    },
  },
  {
    // Second argument is `toJSON` method
    // Just to make sure that if we ever have to turn this thing into JSON,
    // send it over somewhere else, we provide the appropriate properties as
    // well. We also want to make sure that we rename on the fly the `_id`
    // property to `id` to make it consistent across different databases.
    toJSON: {
      // toJSON has `transform` method that receives document and return value
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  // Note: the attrs object right above in the argument, is going to have an
  // `id` property but when we pass it into the constructor, we must rename
  // that thing to `_id` instead
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.userId,
  });
};

// The error around Order on statics build will go away as soon as we define
// the actual model itself
// Here, 'Order' is the new collection
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };

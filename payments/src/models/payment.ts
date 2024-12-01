import mongoose from 'mongoose';

// The only real goals of this payment object here is to somehow relate
// together an order and a charge
// So on the payments object, we're just going to store the id of the order
// and the id of the charge.
// So its gonna relate orders and a charge together, and its going to be the
// presence of this payments that indicates we've successfully paid for a given
// order
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

// This gonna be the list of properties that a payment has. This is going
// to be pretty much same thing as the PaymentAttrs
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  // Version number for keeping track of all that concurrency stuff.
  // Do we want a payment to have a version number? i.e should this thing
  // have a version for keeping track of all that concurrency stuff.
  // The answers is, in general yes probably.
  // But for this application, here I'm essentially creating a payment one
  // time and then never updating it, never changing any properties tied to
  // it whatsoever.
  // The whole idea of a version number is really to keep track and make
  // sure we processed events in a correct order as a given record changed
  // Because our payment record is never going to change because it's really
  // just got that orderId and stripeId and that's it.
  // We really don't need a version number because this thing simply isn't
  // going to change over time, and we're never going to expect to have to
  // emit no events and have to make sure that they are processed in some
  // given order. So in this case, no version is really required.
  // But still its a good practice to just include a version everywhere for
  // every record, even if we don't think we're going to need it right away
  // because we might need it at some point in time in the future.
  // And if I decide to add it in the future, well, that means, I gotta go
  // around to all of my different events related to this record and add
  // in that version property.
  /* version: number; */
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
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

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema,
);

export { Payment };

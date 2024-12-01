import Stripe from 'stripe';

//  `Stripe` is a class and to make use of stripe library, we have to create an
// instance out of that class.
// The entire purpose of this file is to really just create an instance out of
// the Stripe library and then export it so that it can be used in other locations
// inside of our project.

if (!process.env.STRIPE_KEY) {
  throw new Error('STRIPE_KEY must be defined');
}

// To this object right here or the constructor, we're going to provide two
// different arguments. The first argument is going to be our API key.
// Then for the second argument, we're going to provide an options object.
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  // apiVersion: '2020-03-02',
  // apiVersion has autocompletion for date
  apiVersion: '2024-11-20.acacia',
});

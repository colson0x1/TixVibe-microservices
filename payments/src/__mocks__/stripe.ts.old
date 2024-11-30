// Fake copy of `stripe.ts`
// This will be executed or imported only when we are running our code in the
// test environment.
export const stripe = {
  charges: {
    // We are going to make `create` function as JEST mock.
    // Mock functions are really fantastic because we can take a look at
    // them and make sure they get called with appropriate arguments.
    // mockResolvedValue fn makes sure whenever we call the create fn, we're
    // going to get back a promise that automatically resolves itself with an
    // empty object {}.
    // The only reason we're doing this is because back inside our actual
    // route handler (new-charge.ts), our expectation right there is that
    // when we call `create`, we're going to get back some kind of promise
    // and then we're awaiting that promise to be resolved.
    // i.e await stripe.charges.create({ ... });
    // So that's why we're going to mockResolvedValue. We're giong to return a
    // promise immediately that automatically resolves itself.
    create: jest.fn().mockResolvedValue({}),
  },
};

import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'Tomorrowland',
    price: 3300,
    userId: '1111',
  });

  // Save the ticket to the database
  await ticket.save();
  // Now that ticket has been persisted into the database and in theory, when
  // we saved it, Mongoose and more specifically, the updateIfCurrentPlugin
  // should have assigned some kind of version property to it
  // So inside the database, there is now a record that says here is your ticket
  // as a version of 0 or 1 whatever the default version is

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets
  // i.e one change to the first ticket we fetched and another changes to the
  // second ticket we fetched
  // i.e Now we're gonna make a change to the first instance and second instance
  firstInstance!.set({ price: 3600 });
  secondInstance!.set({ price: 4000 });

  // Save the first fetched ticket
  // i.e We are gonna save the first instance, and that should work as
  // expected
  // i.e We're going to expect that is going to work as exepected because the
  // first fetched ticket is gonna have a version number equal to 1 or exactly
  // greater than whatever the initial ticket that we save to the database has
  // or its version number
  // So we're going to expect that the first save is going to work as expected
  await firstInstance!.save();

  // Save the second fetched ticket an expect an error
  // i.e We're gonna save the second instance, and we should expect to
  // see some kind of error
  // i.e When we try to save the second fetched ticket, this thing is gonna have
  // an outdated version number because when we saved the first fetch ticket,
  // it will have incremented the version number inside of our database
  // So when we try to save the second one, we're goint to expect to see
  // some kind of error, something that says, hey, you can't save this, you've
  // got some out of date version number or something similar to that
  // So we're gonna save the second ticket and expect an error
  /* await secondInstance!.save(); */

  // Now we need to fix up the test and make sure that we somehow say that
  // we expect that above line to go wrong
  // JEST do have builtin matchers to help us expect that something is gonna
  // throw an error
  /* expect(async () => {
      await secondInstance!.save();
    }).toThrow(); */
  // That would not work in the old version of JEST because there are
  // some interop issues between JEST and TypeScript
  // Using try catch

  // Resolve: Test functions cannot both take a 'done' callback and return
  // something Error
  // Newer version of JEST may get this failure and error
  // i.e Save the second fetched ticket and expect an error

  // NOTE
  // There a gotcha in using the async await pattern in the older version of JEST.
  // JEST cannot really figure out the async await here. It can't really figure
  // out when our tests are all done when we call return right below. So to
  // help JEST out, we have to receive a callback to our actual test function
  // of `done`
  // i.e `it('implements optimistic concurrency control', async (done) => {})`
  // `done` is a function that we should invoke manually if we want to specificaly
  // tell JEST that we are done with our test and that should not expect
  // anything else to go on with our test.
  try {
    // If this line below throws an error, it will go to catch statement and
    // it will immediately return
    // But if this line does not throw an error, then it will skip the catch
    // statement and it will go down where we throw an error i.e we're going
    // to get the error. that's gonna throw the error and that's going to
    // cause our test to fail
    await secondInstance!.save();
  } catch (err) {
    // console.log(err);
    // We're gonna expect to get into `catch`. And if we get into catch, we're
    // going to immediately return
    // Older version of JEST calling `done` to officially tell JEST that,
    // thats it. Test complete. Don't worry about anything else inside this test.
    /* return done(); */
    // Newer version of JEST doesn't require `done` callback!
    return;
  }

  // And because we should be entering the catch right above, right after that,
  // we're gonna throw an error manually
  // If we return above in the try catch, we would not get to this error
  throw new Error('Should not reach this point');
});

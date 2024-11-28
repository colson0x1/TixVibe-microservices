import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

// @ Interface Augumentation
// Tell TS that there's a global property called signup
/*
declare global {
  namespace NodeJS {
    interface Global {
      signin(): Promise<string[]>;
    }
  }
}
*/
declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;

// @ Hook that runs before all of our tests
// Create an instance of MongoMemoryServer before all of the test setup using
// hook function
beforeAll(async () => {
  /* @ Setting environment variables directly for test environment */
  process.env.JWT_KEY = 'stillhome';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  // Startup MongoDB Memory Server
  /* mongo = new MongoMemoryServer(); */
  // Take a look at the memory server that was just created i.e `mongo` and try
  // to get the URL to connect to it
  /* const mongoUri = await mongo.getUri(); */

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  // Tell mongoose to connect to this `mongoUri` in memory server
  /* await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }) */
  await mongoose.connect(mongoUri, {});
});

// @ Function that going to run before each of our tests
beforeEach(async () => {
  // Before each tests starts, we're going to reach into that mongodb database
  // i.e `mongo` and we're going to delete or essentially reset all the data
  // inside there
  // Use mongoose to take a look at all the different connections that exists
  // inside of this `mongo` and delete all those different collections
  // @ Gives us all the collections that exists
  // const collections = await mongoose.connection.db.collections();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection is not established');
  }

  const collections = await db.collections();

  // Loop over them and tell them to delete all the data inside
  // i.e Its just going to reset all of our data in between each test that we run
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Stop that MongoDB Memory Server after running all of our different tests
// Also tell mongoose to disconnect from it as well
// @ Hook that going to run after all of our tests are complete
/* afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
}) */

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

/* @ Auth Helper */
// getAuthCookie fn
global.signin = (id?: string) => {
  // Build a JWT payload. { id, email }
  const payload = {
    // id: '10000000',
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'colson@google.com',
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  // return `express:sess=${base64}`;
  // return `session=${base64}`;
  // NOTE: The expectation when using `supertest` library is that, we include
  // all of the different cookies in an array!
  return [`session=${base64}`];
};

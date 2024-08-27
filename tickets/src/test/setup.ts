import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

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
  var signin: () => Promise<string[]>;
}

let mongo: any;

// @ Hook that runs before all of our tests
// Create an instance of MongoMemoryServer before all of the test setup using
// hook function
beforeAll(async () => {
  /* @ Setting environment variables directly for test environment */
  process.env.JWT_KEY = 'stillhome';

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
  const collections = await mongoose.connection.db.collections();

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
global.signin = async () => {
  const email = 'colson@google.com';
  const password = 'stillhome';

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
    })
    .expect(201);

  // Pulling off that authentication cookie which contains JWT inside of it
  // and including it on the follow up requests setting the headers of the
  // request so that it works smoothly in the supertest environement
  const cookie = response.get('Set-Cookie') as string[];

  return cookie;
};

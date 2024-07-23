// @ DatabaseConnectionError Subclass
export class DatabaseConnectionError extends Error {
  statusCode = 500;
  reason = 'Error connecting to database';

  constructor() {
    super();

    // Initialization line because extending a built-in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    // console.log('handling this error as a db connection error');

    // Transform into that same exact response structure as architected

    // Return array of objects that has the `message` and `field` properties
    // Still allow Error Handling Middleware to create the common response
    // structure i.e to create actual object and assign the `errors` property
    // to it
    return [{ message: this.reason }];
  }
}

// @ Database Connection Error Subclass
import { CustomError } from './custom-error';

// export class DatabaseConnectionError extends Error {
export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = 'Error connecting to database';

  constructor() {
    super('Error connecting to db');

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

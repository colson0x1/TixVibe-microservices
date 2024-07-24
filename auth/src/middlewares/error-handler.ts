import { Request, Response, NextFunction } from 'express';
// import { RequestValidationError } from '../errors/request-validation-error';
// import { DatabaseConnectionError } from '../errors/database-connection-error';
import { CustomError } from '../errors/custom-error';

// Always send back a very identical consistently structured message because
// I don't want engineers working on the React application to figure out
// exactly how to handle all these 'n' different errors
// @ Build one single identical structure for all possible errors across
// all of the different services
// console.log('Something went wrong.', err);

/* @ Common Error Response Structure for all servers
 * {
 *    errors: {
 *      message: string,
 *      field?: string
 *    }[]
 * }
 * */

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /* if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  if (err instanceof DatabaseConnectionError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  } */

  // Now if any error is thrown from a Request Handler that is extending
  // CustomError Abstract Class, the Error Handling Middleware is now going to
  // handle it appropriately
  // Its going to take the `statusCode` off the CustomError instance. It's going
  // to call `serializeErrors` and this is going to 100% gurantee as best as we
  // possibly can that whenever we send a response back from any Route Handler
  // in any of our services, we're always going to have a consistent structure
  // going back!
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  // Unknown error or generic error
  res.status(400).send({
    // message: 'Something went wrong',
    // message: err.message,
    errors: [{ message: 'Something went wrong' }],
  });
};

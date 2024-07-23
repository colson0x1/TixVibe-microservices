import { Request, Response, NextFunction } from 'express';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

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
  if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  if (err instanceof DatabaseConnectionError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  // Unknown error or generic error
  res.status(400).send({
    // message: 'Something went wrong',
    // message: err.message,
    errors: [{ message: 'Something went wrong' }],
  });
};

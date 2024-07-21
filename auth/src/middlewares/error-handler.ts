import { Request, Response, NextFunction } from 'express';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Always send back a very identical consistently structured message because
  // I don't want engineers working on the React application to figure out
  // exactly how to handle all these 'n' different errors
  // @ Build one single identical structure for all possible errors across
  // all of the different services
  // console.log('Something went wrong.', err);

  if (err instanceof RequestValidationError) {
    console.log('handling this error as a request validation error')
  }

  if (err instanceof DatabaseConnectionError) {
    console.log('handling this error as a db connection error');
  }

  res.status(400).send({
    // message: 'Something went wrong',
    message: err.message,
  });
};

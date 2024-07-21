import { Request, Response, NextFunction } from 'express';

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
  console.log('Something went wrong.', err);

  res.status(400).send({
    // message: 'Something went wrong',
    message: err.message,
  });
};

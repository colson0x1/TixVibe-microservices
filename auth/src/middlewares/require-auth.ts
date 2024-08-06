import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // We're really going to make a big assumption here. We're going to assume that
  // we'll never use the `requireAuth` middleware without previously running the
  // `currentUser` middleware
  // @ If `req.currentUser` is not defined, we need to reject this request and
  // respond with an error
  if (!req.currentUser) {
    // return res.status(401).send();
    // Custom error to handle the case in which a user is trying to access
    // a route they do not have access to

    throw new NotAuthorizedError();
  }

  next();
};

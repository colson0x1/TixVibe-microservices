/* @ Current User Middleware */
// Anytime we've a route hanlder that needs to know who the current user is,
// we'll just make use of this middleware

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Figure out weather or not user is logged in and if they are, extract
  // information out of that JWT payload and set it on req.currentUser
  // `currentUser` is just a common property to describe who the current user is
  // inside of an Express application
  // If the user is not logged in, we're not gonna throw error or anything like
  // that
  // That is going to be the job of other middleware
  // The only job of this one is, hey if you're logged in, im gonna extract
  // information off that payload and set it on this currentUser property

  // @ Check whether or not the user is logged in:
  // Check whether or not the the user has JWT
  if (!req.session?.jwt) {
    return next();
  }

  // If we get pass this point, we would want to decode the JWT
  // If anyting goes wrong with the decoding process, we're going to capture
  // that error
  try {
    // Apply a more precise definition of exactly what we're getting back
    // from the verify call
    // i.e create an interface that precisely describes exactly what payload is
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!,
    ) as UserPayload;
    // Setting on the request object so further middlewares or other
    // route handlers down the chain can figure out automatically who the
    // current user is
    // Add in a new property to an existing object type that is already defined
    // inside of a type definition file
    req.currentUser = payload;
  } catch (err) {}

  // Weather or not we decode that token successfully, we always want to continue
  // on to the next middleware
  next();
};

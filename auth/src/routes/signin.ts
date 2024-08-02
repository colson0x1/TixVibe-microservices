import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { Password } from '../services/password';
import { User } from '../models/user';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // @ Error is now handled by validateRequest middleware
    /* 
    // Gives errors on that ` req`
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // @ Requirement on RequestValidationError is that we need to pass
      // an array of errors
      throw new RequestValidationError(errors.array());
    } */

    // Pull email and password out of the body of the request
    const { email, password } = req.body;

    // Run a query and try to find some user inside of our database with this email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      // If we failed to find one, throw an error immediately and bail out of
      // everything inside of this Request Handler
      // Its a good place to use the generic custom error `BadRequestError`
      // @ Note on Authentication
      // When we're dealing with authentication, we try to provide as little
      // information as possible. We don't wanna tell em that the email doesn't
      // exist, we just wanna say, sorry but you provide us some bad login credentials
      // or we can just say, login request failed, something like that.
      // And here, generic custom error of `BadRequestError` comes handy
      // We can optionally provide a reason for the Error on the BadRequestError
      // I'm gonna give very simple a direct message that's very generic in nature
      throw new BadRequestError('Invalid credentials');
    }

    // Compare supplied password and stored password of the user that is just
    // fetched from the DB
    // passwordsMatch is going to be a boolean
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password,
    );
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid Credentials');
    }

    // User is now considered to be logged in
    // Generate a JWT and send it back inside of a cookie
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        // }, 'stillhome')
      },
      // process.env.JWT_KEY,
      // This env variable is checked at the application start up time, right
      // there in start fn of `index.ts`
      process.env.JWT_KEY!,
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    // Send back our response
    // Since we're no longer creating a new record inside of our database
    // so traditionally we would send back a 200
    res.status(200).send(existingUser);
  },
);

export { router as signinRouter };

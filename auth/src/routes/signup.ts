import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // return res.status(400).send(errors.array());

      /* 
      // Approach with pure JavaScript
      const error = new Error('Invalid email or password');
      error.reasons = errors.array();
      throw error; */

      // throw new Error('Invalid email or password');

      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    /* if (!email || typeof email !== 'string') {
      res.status(400).send('Provide a valid email');
    } */

    console.log('Creating a user...');
    // throw new Error('Error connecting to database');
    throw new DatabaseConnectionError();

    res.send({});
  },
);

export { router as signupRouter };

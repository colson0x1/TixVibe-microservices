import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest } from '../middlewares/validate-request';

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
  (req: Request, res: Response) => {
    // @ Error is now handled by validateRequest middleware
    /* 
    // Gives errors on that ` req`
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // @ Requirement on RequestValidationError is that we need to pass
      // an array of errors
      throw new RequestValidationError(errors.array());
    } */
  },
);

export { router as signinRouter };

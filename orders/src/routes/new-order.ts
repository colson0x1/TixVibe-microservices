import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@tixvibe/common';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      // Subtle service coupling
      // Make sure user is providing a valid Mongo ID
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  // If anything goes wrong with the validation step, we reject the request
  // right away and send back an error message with validateRequest middleware
  validateRequest,
  async (req: Request, res: Response) => {
    res.send({});
  },
);

export { router as newOrderRouter };

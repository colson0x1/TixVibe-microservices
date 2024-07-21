import { ValidationError } from 'express-validator';

// @ RequestValidationError Subclass
export class RequestValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super();

    // @ Only because extending a built in class
    // When using TypeScript and try to extend a class that is built-in to
    // language i.e trying to extend Error which is built into language,
    // this additional line gets class to work correctly because just
    // extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}

// @ Uses
// errors - is list of errors i.e an array of validation errors
// throw new RequestValidationError(errors);

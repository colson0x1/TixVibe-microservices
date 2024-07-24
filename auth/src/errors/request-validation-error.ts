/* @ Request Validation Error Subclass */
import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

/* interface CustomError {
  statusCode: number;
  serializeErrors(): {
    message: string;
    field?: string;
  }[];
} */

/* export class RequestValidationError extends Error implements CustomError { */
// export class RequestValidationError extends Error {
export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super('Invalid request parameters');

    // @ Only because extending a built in class
    // When using TypeScript and try to extend a class that is built-in to
    // language i.e trying to extend Error which is built into language,
    // this additional line gets class to work correctly because just
    // extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    // console.log('handling this error as a request validation error')
    /* const formattedErrors = err.errors.map(error => {
      return { message: error.msg, field: error.param }
    }) 
    return res.status(400).send({ errors: formattedErrors });
    */
    // breaking changes in v7 of express-validator library

    // @ Build list of formatted errors
    // This mapping statement generates that array of objects
    return this.errors.map((err) => {
      if (err.type === 'field') {
        // Now throw that into an object as a value for the errors property
        // to transform into common error response structure as architected
        return { message: err.msg, field: err.path };
      }
      return { message: err.msg };
    });
  }
}

// @ Uses
// errors - is list of errors i.e an array of validation errors
// throw new RequestValidationError(errors);

/* const formattedErrors = err.errors.map((error) => {
      if (error.type === 'field') {
        return { message: error.msg, field: error.path };
      }
    });

    // `formattedErrors` is now the array of objects
    // Now throw that into an object as a value for the errors property
    // to transform into common error response structure as architected
    return res.status(400).send({ errors: formattedErrors }); */

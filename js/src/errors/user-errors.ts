import { BaseError } from "./base-error";
import { ERROR_TYPES } from "./error-types";

export class UserError extends BaseError {
  constructor(statusCode: number, message: string) {
    const errorType = ERROR_TYPES.user_error;
    super(
      `${errorType}: user error occured with statusCode: ${statusCode} and msg: '${message}'
      `
    );
    this.errorType = errorType;
  }
}

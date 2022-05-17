import { BaseError } from "./base-error";
import { ERROR_TYPES } from "./error-types";

export class ServerError extends BaseError {
  constructor(statusCode: number, message: string) {
    const errorType = ERROR_TYPES.server_error;
    super(
      `${errorType}: an unexpected server error occured with statusCode: ${statusCode} and message: '${message}'
      `
    );
    this.errorType = errorType;
  }
}

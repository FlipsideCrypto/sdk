import { BaseError } from "./base-error";
import { ERROR_TYPES } from "./error-types";

export class UnexpectedSDKError extends BaseError {
  constructor(message: string) {
    const errorType = ERROR_TYPES.sdk_error;
    super(`${errorType}: ${message}`);
    this.errorType = errorType;
  }
}

import { ERROR_TYPES } from "./error-types";

export class BaseError extends Error {
  errorType: string;
  data: Record<any, any>;
  constructor(message: string) {
    super(message);
    this.errorType = ERROR_TYPES.default;
    this.data = {};
  }
}

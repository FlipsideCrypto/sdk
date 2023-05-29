import { SDKError } from "./sdk-error.type";

export type SDKResponse<DataType> =
  | {
      status: "ok";
      data: DataType;
      error: null;
    }
  | {
      status: "error";
      data: null;
      error: SDKError;
    };

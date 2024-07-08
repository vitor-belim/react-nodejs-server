import { Response } from "express";

interface ApiResponse {
  status: boolean;
  message: string;
}

interface ApiSuccessResponse<T> extends ApiResponse {
  data: T;
}

interface ApiErrorResponse extends ApiResponse {
  error?: Error;
}

export default class ResponseHelper {
  static entityNotFound(res: Response) {
    this.error(res, "Entity not found");
  }

  static entityNotOwned(res: Response) {
    this.error(res, "Entity not owned", 403);
  }

  static entityDeleted(res: Response) {
    this.success(res, true, "Entity deleted");
  }

  static success<T>(res: Response, data: T, message: string = "Success") {
    res.json(<ApiSuccessResponse<T>>{
      status: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    code: number = 400,
    error?: Error,
  ) {
    const response: ApiErrorResponse = {
      status: false,
      message,
    };

    if (error) {
      response.error = error;
    }

    res.status(code).json(response);
  }
}

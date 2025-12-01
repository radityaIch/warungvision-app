import { z } from "zod";

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError["errors"]
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export const validateDto = <T>(schema: z.Schema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.errors);
  }
  return result.data;
};

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorResponse = (error: any) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof ValidationError) {
    return {
      statusCode: 400,
      message: error.message,
      errors: error.errors,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: "Internal server error",
  };
};

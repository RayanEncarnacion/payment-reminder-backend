import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";

import { StatusCodes } from "http-status-codes";

export function validateData(
  schema: z.ZodEffects<any, any> | z.ZodObject<any, any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorsDictionary = error.errors.reduce(
          (acc: Record<string, any>, issue: ZodIssue) => {
            acc[issue.path[0]] = issue.message;
            return acc;
          },
          {}
        );

        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid data", inputs: errorsDictionary });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error" });
      }
    }
  };
}

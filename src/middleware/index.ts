import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";
import { StatusCodes } from "http-status-codes";
import jwt, { TokenExpiredError } from "jsonwebtoken";

class Middleware {
  validateParams(schema: z.ZodSchema<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.params);
        next();
      } catch (error: any) {
        handleZodError(error, res);
      }
    };
  }

  validateBody(schema: z.ZodEffects<any, any> | z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        handleZodError(error, res);
      }
    };
  }

  validateAuthToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Access denied" });
      return;
    }

    try {
      const decoded = jwt.verify(token!, process.env.JWT_SECRET!);
      (req as any).authToken = decoded;
      next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        res.status(401).json({ message: "Token has expired" });
        return;
      }
      res.status(403).json({ message: "Invalid token" });
    }
  }
}

export default new Middleware();

function handleZodError(error: any, res: Response) {
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

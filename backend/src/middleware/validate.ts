import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid request body",
          details: error.errors.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        });
      }

      return res.status(400).json({ error: "Invalid request body" });
    }
  };
}

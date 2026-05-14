import type { NextFunction, Request, Response } from "express";

export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.ADMIN_API_KEY;
  const providedKey = req.header("x-admin-key");

  // TODO: replace this shared key with proper admin authentication before public launch.
  if (!configuredKey || providedKey !== configuredKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

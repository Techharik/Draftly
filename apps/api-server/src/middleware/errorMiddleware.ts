import { Request, Response, NextFunction } from "express";

import { logger } from "@draftly/logger";

export function errorMiddleware(
  err: any,
  _: Request,
  res: Response,
  __: NextFunction,
) {
  logger.error({
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    error: "Internal Server Error",
  });
}

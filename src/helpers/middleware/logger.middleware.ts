// @ts-nocheck
import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${req.method}]\t\t${req.path}`);
  next();
};

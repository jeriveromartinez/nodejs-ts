import { NextFunction, Request, Response } from "express";
import { createHmac } from "crypto";

const generateHmac = (key: string, session: string): string => {
  const hmac = createHmac("sha256", Buffer.from(key, "utf8"));
  hmac.update(session);
  return hmac.digest("hex");
};

const getKey = (param: string): string => {
  return param.slice(7);
};

export const CheckAppSession = (request: Request, response: Response, next: NextFunction) => {
  const agent = request.header("User-Agent");
  const session = request.header("Session");
  const token = request.header("Token");
  const key = getKey(request.header("Serial"));

  const sign = generateHmac(key, agent + "/" + session);

  if (token !== sign) {
    const status = 401;
    const message = "Forbidden access";
    response.status(status).send({ status, message });
  } else next();
};

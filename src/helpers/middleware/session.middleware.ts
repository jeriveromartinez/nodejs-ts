// @ts-nocheck
import * as jwt from "jwt-simple";
import { NextFunction, Response } from "express";
import { CustomRequest, IResponse } from "../../common/base";
import Constants from "../../config/constants/constants";
import { SessionRepository } from "../../repositories";
import { ISession } from "../../models/session.auth";
import { NotFoundException } from "../../common/exceptions";
import { IUserDocument } from "../../models/user";

const sessions = new SessionRepository();

export const CheckSession = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const [, token] = request.headers.authorization.split(" ");
    const { email, id, access } = jwt.decode(
      token,
      Constants.JWT_SECRET,
      false,
      "HS512"
    ) as IUserDocument;

    const exits = await sessions.findBy(<ISession>{ user: id, token, removed: false });
    if (!exits) throw new NotFoundException();
    await sessions.update(exits.id, <ISession>{ updatedAt: new Date() });
    request.client = { email, id, access, token };
    next();
  } catch (error) {
    response.status(401).json(<IResponse<null>>{ error: true, message: "Unauthorized" });
  }
};

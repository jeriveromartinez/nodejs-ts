import { Request } from "express";
import { UserAccess } from "../../models/user";
import { IController } from "./base.controller";

export abstract class IPlugin {
  static run(): any {}
}

export interface ICOption {
  versionPath: string;
  controllers: IController[];
}

export interface CustomRequest extends Request {
  client: {
    id: string;
    email: string;
    token: string;
    access: UserAccess;
  };
}

import { IUser } from "../user";
import { IModel, IDocument } from "../../common/base";

export interface ISession extends IModel {
  user: IUser | string;
  token: string;
  ip: string;
}

export interface ISessionDocument extends ISession, IDocument<ISession> {}

import { IDocument, IModel } from "../../common/base";

export enum UserAccess {
  Admin = "administrator",
  Client = "client",
}

export interface IUser extends IModel {
  email: string;
  password?: string;
  fullName: string;
  access: UserAccess;
  active?: boolean;

  IsValidPassword?(password: string): boolean;
}

export interface IUserDocument extends IUser, IDocument<IUser> {}

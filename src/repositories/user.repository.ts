import { RepositoryBase } from "../common/base";
import UserSchema, { IUser, IUserDocument } from "../models/user";

export default class UserRepository extends RepositoryBase<IUserDocument, IUser> {
  constructor() {
    super(UserSchema);
  }
}

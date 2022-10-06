import * as bcrypt from "bcrypt";
import { Model, Query, UpdateQuery, Schema } from "mongoose";
import DataAccess from "../../common/base/data.access";
import { IUserDocument, UserAccess, IUser } from "./user.interface";

const mongooseConnection = DataAccess.mongooseConnection;

class UserSchema {
  static schema() {
    const schema = new Schema<IUserDocument, Model<IUserDocument>, IUser>({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      fullName: { type: String, required: true },
      access: { type: String, enum: Object.values(UserAccess), required: true },
      active: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      removed: { type: Boolean, required: true, default: false },
    });

    schema.pre("save", function (next) {
      if (this.isModified("password")) {
        const password = bcrypt.hashSync(this.password, 10);
        this.password = password;
      }
      next();
    });

    schema.pre("updateOne", { query: true }, function (next) {
      const set = (
        (
          this as unknown as Query<IUserDocument, IUserDocument>
        ).getUpdate() as UpdateQuery<IUserDocument>
      ).$set;
      if (!set.password) return next();

      const hash = bcrypt.hashSync(set.password, 10);
      set.password = hash;
      next();
    });

    schema.methods.IsValidPassword = function (password: string) {
      return bcrypt.compareSync(password, this.password);
    };

    return mongooseConnection.model<IUserDocument>("User", schema);
  }
}

export default UserSchema.schema();

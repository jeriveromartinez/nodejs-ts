import { Model, Schema } from "mongoose";
import DataAccess from "../../common/base/data.access";
import { ISessionDocument, ISession } from "./session.interface";

const mongooseConnection = DataAccess.mongooseConnection;

class SessionSchema {
  static schema() {
    const schema = new Schema<ISessionDocument, Model<ISessionDocument>, ISession>({
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      token: { type: String, required: true },
      ip: { type: String, required: true, default: "" },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      removed: { type: Boolean, required: true, default: false },
    });

    return mongooseConnection.model<ISessionDocument>("Session", schema);
  }
}

export default SessionSchema.schema();

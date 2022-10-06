import { RepositoryBase } from "../common/base";
import SessionSchema, { ISession, ISessionDocument } from "../models/session.auth";

export default class SessionRepository extends RepositoryBase<ISessionDocument, ISession> {
  constructor() {
    super(SessionSchema);
  }
}

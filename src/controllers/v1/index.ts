import { IController } from "../../common/base/base.controller";
import AuthController from "./auth.controller";
import UserController from "./user.controller";

export const apiVersion = "v1";

export default <IController[]>[AuthController, UserController];

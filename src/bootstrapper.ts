import * as helmet from "helmet";
import * as cors from "cors";
import { urlencoded, json } from "express";
import App from "./app";
import loggerMiddleware from "./helpers/middleware/logger.middleware";
import controllerApi, { apiVersion as apiV1 } from "./controllers/v1";
import Constants from "./config/constants/constants";

const app = new App({
  port: Constants.NODE_PORT,
  controllers: [{ versionPath: apiV1, controllers: controllerApi }],
  middleWares: [
    cors({ credentials: true, origin: true }),
    urlencoded({ extended: true }),
    json(),
    helmet(),
    loggerMiddleware,
  ],
  services: [],
});

app.listen();

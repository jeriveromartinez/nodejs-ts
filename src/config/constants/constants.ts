import config from "../config";

export enum ENV {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}
class Constants {
  static NODE_ENV: string = process.env.NODE_ENV || ENV.DEVELOPMENT;
  static NODE_PORT: number = +process.env.NODE_PORT || config.port;
  static JWT_SECRET: string = process.env.JWT_SECRET || config.jwtSecret;

  static DB_HOST: string =
    process.env.DB_HOST || config[Constants.NODE_ENV].DB_HOST;
  static DB_PORT: string =
    process.env.DB_PORT || config[Constants.NODE_ENV].DB_PORT;
  static DB_USER: string =
    process.env.DB_USER || config[Constants.NODE_ENV].DB_USER;
  static DB_PASS: string =
    process.env.DB_PASS || config[Constants.NODE_ENV].DB_PASS;
  static DB_NAME: string =
    process.env.DB_NAME || config[Constants.NODE_ENV].DB_NAME;

  static DB_CONNECTION_STRING: string =
    process.env.DB_CONNECTION_STRING ||
    config[Constants.NODE_ENV].DB_CONNECTION_STRING;
  static MONGODB_OPTS = config.mongoOpts;
  static RESOLVE_EMAIL = config[Constants.NODE_ENV].resolveEmail;
}

Object.seal(Constants);
export default Constants;

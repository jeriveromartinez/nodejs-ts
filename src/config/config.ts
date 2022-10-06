export default {
  port: 9000,
  jwtSecret: "",
  mongoOpts: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  production: {
    DB_CONNECTION_STRING: "mongodb://127.0.0.1:27017/base?replicaSet=rs0",
  },
  development: {
    DB_CONNECTION_STRING: "mongodb://127.0.0.1:27017/base",
  },
};

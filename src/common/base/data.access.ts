import * as Mongoose from 'mongoose';
import Constants from '../../config/constants/constants';

class DataAccess {
    private static mongooseInstance: Promise<typeof Mongoose>;
    static mongooseConnection: Mongoose.Connection;

    constructor() {
        DataAccess.connect();
    }

    static connect(): Promise<typeof Mongoose> {
        if (this.mongooseInstance) return this.mongooseInstance;
        this.mongooseConnection = Mongoose.connection;

        this.mongooseConnection.once('connected', () => {
            console.log(`Connected to mongodb server`);
        });

        this.mongooseConnection.once('error', (error) => {
            console.log(`Error in mongodb connection: ${error}`);
            this.mongooseInstance = Mongoose.connect(
                Constants.DB_CONNECTION_STRING,
                Constants.MONGODB_OPTS as Mongoose.ConnectOptions,
            );
        });

        this.mongooseConnection.once('disconnect', () => {
            console.log(`Mongodb got disconnected`);
            this.mongooseInstance = Mongoose.connect(
                Constants.DB_CONNECTION_STRING,
                Constants.MONGODB_OPTS as Mongoose.ConnectOptions,
            );
        });

        this.mongooseInstance = Mongoose.connect(
            Constants.DB_CONNECTION_STRING,
            Constants.MONGODB_OPTS as Mongoose.ConnectOptions,
        );
        return this.mongooseInstance;
    }
}

DataAccess.connect();
export default DataAccess;

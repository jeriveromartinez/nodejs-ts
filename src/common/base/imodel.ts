import { Document } from 'mongoose';
import { ObjectID, ObjectId } from 'bson';

export interface IModel {
    createdAt?: Date | number | string;
    updatedAt?: Date | number | string;
    removed?: boolean;
}

export interface IDocument<T extends IModel> extends IModel, Document<string | ObjectId> {
    id: string;
    _id: string | ObjectID;
    _doc: T;
}

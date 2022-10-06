import { IDocument, IModel } from './imodel';
import { FilterQuery, Model, UpdateQuery, QueryOptions, ClientSession, SortOrder } from 'mongoose';
import { ObjectID } from 'bson';

export interface IUpdate {
    ok?: number;
    n?: number;
    nModified?: number;
    deletedCount?: number;
}

export type InputType = string | Object | Object[];
export type Sort = string | { [key: string]: SortOrder | { $meta: 'textScore' } } | undefined | null;

export default class RepositoryBase<D extends IDocument<T>, T extends IModel> {
    protected _model: Model<D>;

    constructor(schemaModel: Model<D>) {
        this._model = schemaModel;
    }

    public async create(item: T): Promise<D> {
        const model = new this._model(item);
        return model.save();
    }

    public async find(
        id: string | ObjectID,
        populate?: InputType,
        select?: InputType,
        session?: ClientSession,
        likeObject?: boolean,
    ): Promise<D> {
        const options: QueryOptions = session ? { session } : null;
        const query = this._model.findOne(<FilterQuery<D>>{ _id: id, removed: false }, null, options);
        if (populate) query.populate(populate as string);
        if (select) query.select(select);

        return likeObject ? (query.lean().exec() as unknown as D) : query.exec();
    }

    public async findBy(
        condition: T | FilterQuery<D>,
        populate?: InputType,
        select?: InputType,
        sort?: Sort,
        likeObject?: boolean,
    ): Promise<D> {
        if (!condition) condition = <T>{ removed: false };
        if (condition.removed === undefined) condition.removed = false;

        const query = this._model.findOne(<FilterQuery<D>>condition, null);
        if (populate) query.populate(populate as string);
        if (select) query.select(select);
        if (sort) query.sort(sort);

        return likeObject ? (query.lean().exec() as unknown as D) : query.exec();
    }

    public async list(
        condition?: T | FilterQuery<D>,
        limit?: number,
        skip?: number,
        populate?: InputType,
        sort?: Sort,
        select?: InputType,
        likeObject?: boolean,
    ): Promise<D[]> {
        if (!condition) condition = <T>{ removed: false };
        if (!condition.removed) condition.removed = false;

        const query = this._model.find(<FilterQuery<D>>condition);

        if (sort) query.sort(sort);
        if (limit) query.limit(limit);
        if (skip) query.skip(skip);
        if (populate) query.populate(populate as string);
        if (select) query.select(select);

        return likeObject ? (query.lean().exec() as unknown as D[]) : query.exec();
    }

    public async count(condition?: T | FilterQuery<D>): Promise<number> {
        if (!condition) condition = <T>{ removed: false };
        if (!condition.removed) condition.removed = false;
        const query = this._model.countDocuments(<FilterQuery<D>>condition);

        return query.exec();
    }

    public async remove(id: string | ObjectID): Promise<IUpdate> {
        return this._model
            .updateOne(<FilterQuery<D>>{ _id: id }, <UpdateQuery<D>>{ $set: { removed: true, updatedAt: new Date() } })
            .exec() as IUpdate;
    }

    public async removeMany(condition: T | FilterQuery<D>): Promise<IUpdate> {
        if (!condition) condition = <T>{ removed: false };
        if (!condition.removed) condition.removed = false;
        return this._model
            .updateMany(<FilterQuery<D>>condition, <UpdateQuery<D>>{ $set: { removed: true } })
            .exec() as IUpdate;
    }

    public async purge(id: string | ObjectID): Promise<IUpdate> {
        return this._model.deleteOne(<FilterQuery<D>>{ _id: id }).exec();
    }

    public async purgeMany(condition: T | FilterQuery<D>): Promise<IUpdate> {
        return this._model.deleteMany(<FilterQuery<D>>condition).exec();
    }

    public async updateRaw(id: string | ObjectID, record: UpdateQuery<D>): Promise<IUpdate> {
        record.updatedAt = new Date();
        return this._model.updateOne(<FilterQuery<D>>{ _id: id }, record).exec() as IUpdate;
    }

    public async update(id: string | ObjectID, record: T): Promise<IUpdate> {
        record.updatedAt = new Date();
        return this.updateRaw(id, <UpdateQuery<D>>{ $set: record });
    }

    public async updateMany(condition: T | FilterQuery<D>, record: T): Promise<IUpdate> {
        if (!condition) condition = <T>{ removed: false };
        if (!condition.removed) condition.removed = false;
        record.updatedAt = new Date();

        return this._model
            .updateMany(<FilterQuery<D>>condition, <UpdateQuery<D>>{ $set: record as unknown })
            .exec() as IUpdate;
    }

    public async findByAndUpdate(condition: T, records: T, populate?: InputType): Promise<D> {
        records.updatedAt = new Date();
        const query = this._model.findOneAndUpdate(<FilterQuery<D>>condition, <UpdateQuery<D>>{ $set: records as any });
        if (populate) query.populate(populate as string);
        return <Promise<D>>query.exec();
    }

    public async insert(
        condition: T,
        records: T,
        options: QueryOptions = { upsert: true, runValidators: true, setDefaultsOnInsert: true },
        populate?: InputType,
    ): Promise<D> {
        records.updatedAt = new Date();
        const query = this._model.findOneAndUpdate(
            <FilterQuery<D>>condition,
            <UpdateQuery<D>>{ $set: records as any },
            <QueryOptions>options,
        );
        if (populate) query.populate(populate as string);

        return <Promise<D>>query.exec();
    }
}

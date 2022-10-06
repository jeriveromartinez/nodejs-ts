// @ts-nocheck
import { Router, Application, Request, Response } from "express";
import { AnyObject } from "mongoose";
import HttpException from "../exceptions/http.exception";

export interface IController {}

export interface IResponse<T> {
  error: boolean;
  message?: string;
  data: T;
}

export interface IList<T> {
  total: number;
  list: T[];
}

export default abstract class BaseController implements IController {
  protected router: Router;
  protected path: string;
  private app: Application;

  constructor(app: Application, router: Router, path: string) {
    this.app = app;
    this.path = path;
    this.router = router;
    this.initRoutes();
    this.app.use(this.path, this.router);
  }

  protected abstract initRoutes(): void;

  protected pagination(req: Request) {
    const skip: number = Number(req.query.page) > 1 ? Number(req.query.page) - 1 : 0;
    const limit: number = Number(req.query.limit) || 10;

    return { skip: skip * limit, limit };
  }

  protected order(req: Request): Record<string, 1 | -1 | { $meta: "textScore" }> {
    const key = req.query.orderkey as string;
    const value = Number(req.query.ordervalue);

    if (key && (value == 1 || value == -1)) {
      const order = {};
      order[key] = value;
      return order;
    }

    return null;
  }

  protected search(req: Request, params: string[], others: Object = {}): AnyObject {
    const search = (req.query.search as string) || "";
    if (search && search.length > 1) {
      const filter = { $regex: new RegExp(search, "i") };
      return params.length
        ? {
            $or: params.map((el) => {
              return { [el]: filter };
            }),
            ...others,
          }
        : { ...others };
    }

    return others;
  }

  protected handleError(error: Error, res: Response): Response {
    if (error instanceof HttpException)
      return res
        .status(error.status)
        .json(<IResponse<null>>{ error: true, message: error.message });
    return res.status(500).json(<IResponse<null>>{ error: true, message: "Internal Server Error" });
  }
}

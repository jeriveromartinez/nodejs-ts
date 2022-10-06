// @ts-nocheck
import { Application, Response, Router } from "express";
import { CheckSession } from "../../helpers/middleware/session.middleware";
import { BaseController, CustomRequest, IList, IResponse } from "../../common/base";
import { NotFoundException } from "../../common/exceptions";
import { UserRepository } from "../../repositories";
import { IUser } from "../../models/user";

export default class UserController extends BaseController {
  private userRepo: UserRepository;

  constructor(app: Application, router: Router) {
    super(app, router, "/user");
    this.userRepo = new UserRepository();
  }

  protected initRoutes(): void {
    this.router.get(this.path, CheckSession, this.list.bind(this));
    this.router.post(this.path, CheckSession, this.create.bind(this));
    this.router.get(`${this.path}/:id`, CheckSession, this.get.bind(this));
    this.router.put(`${this.path}/:id`, CheckSession, this.update.bind(this));
    this.router.delete(`${this.path}/:id`, CheckSession, this.delete.bind(this));
  }

  private async list(req: CustomRequest, res: Response) {
    try {
      const { skip, limit } = this.pagination(req);
      const sort = this.order(req);
      const conditions = this.search(req, ["email", "fullName"]);
      const [users, total] = await Promise.all([
        this.userRepo.list(
          conditions,
          limit,
          skip,
          null,
          sort,
          "-__v -password -removed -updatedAt"
        ),
        this.userRepo.count(conditions),
      ]);

      return res.json(<IResponse<IList<IUser>>>{ error: false, data: { total, list: users } });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async create(req: CustomRequest, res: Response) {
    try {
      const { email, access, password, fullName, active } = req.body as IUser;
      await this.userRepo.create(<IUser>{ email, access, password, fullName, active });

      res.json(<IResponse<null>>{ error: false, message: "created" });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async get(req: CustomRequest, res: Response) {
    try {
      const user = await this.userRepo.find(req.params.id);
      if (!user) throw new NotFoundException(req.params.id);

      return res.json(<IResponse<IUser>>{ error: false, data: user });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async update(req: CustomRequest, res: Response) {
    try {
      const user = await this.userRepo.find(req.params.id);
      if (!user) throw new NotFoundException(req.params.id);

      const { access, fullName, email, password, active } = req.body as IUser;
      const record = { access, fullName, email, active } as IUser;
      if (password) record.password = password;

      await this.userRepo.update(req.params.id, record);
      return res.json(<IResponse<null>>{ error: false, message: "updated" });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async delete(req: CustomRequest, res: Response) {
    try {
      const user = await this.userRepo.find(req.params.id);
      if (!user) throw new NotFoundException(req.params.id);

      await this.userRepo.update(req.params.id, <IUser>{ removed: true });
      return res.json(<IResponse<null>>{ error: false, message: "removed" });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}

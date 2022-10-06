// @ts-nocheck
import * as jwt from "jwt-simple";
import * as requestIp from "request-ip";
import { Application, Request, Response, Router } from "express";
import { SessionRepository, UserRepository } from "../../repositories";
import { BaseController, IResponse, CustomRequest, IList } from "../../common/base";
import { NotFoundException, UnauthorizedException, ForbiddenException } from "../../common/exceptions";
import { CheckSession } from "../../helpers/middleware/session.middleware";
import { ISession, ISessionDocument } from "../../models/session.auth";
import { IUser, IUserDocument, UserAccess } from "../../models/user";
import Constants from "../../config/constants/constants";

export default class AuthController extends BaseController {
  private userRepo: UserRepository;
  private sessionRepo: SessionRepository;

  constructor(app: Application, router: Router) {
    super(app, router, "/authentication");
    this.userRepo = new UserRepository();
    this.sessionRepo = new SessionRepository();
  }

  protected initRoutes(): void {
    this.router.post(this.path, this.login.bind(this));
    this.router.get(this.path, CheckSession, this.check.bind(this));
    this.router.post(`${this.path}/register`, this.register.bind(this));
    this.router.post(`${this.path}/password`, CheckSession, this.changePassword.bind(this));
    this.router.get(`${this.path}/sessions`, CheckSession, this.sessionActive.bind(this));
    this.router.delete(`${this.path}/close/:id`, CheckSession, this.closeSession.bind(this));
  }

  private async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as IUser;
      const user = await this.userRepo.findBy(<IUser>{ email, removed: false, active: true });
      if (!user || !user.IsValidPassword(password)) throw new UnauthorizedException();

      const ip = requestIp.getClientIp(req);
      const token = jwt.encode(
        { email: user.email, id: user.id, access: user.access, ip, hash: Date.now() },
        Constants.JWT_SECRET,
        "HS512"
      );
      await this.sessionRepo.create(<ISession>{ user: user.id, token, ip });
      res.json(<IResponse<IUser & { token: string; _id: string }>>{
        error: false,
        message: "auth",
        data: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          access: user.access,
          token,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async register(req: Request, res: Response) {
    let client: IUserDocument;
    try {
      const { email, password, fullName } = req.body as IUser;

      client = await this.userRepo.create(<IUser>{
        email,
        password,
        fullName,
        access: UserAccess.Client,
      });

      res.json(<IResponse<null>>{ error: false, message: "created" });
    } catch (error) {
      if (client) await this.userRepo.purge(client._id);
      this.handleError(error, res);
    }
  }

  private async check(req: CustomRequest, res: Response) {
    try {
      return res.json(<IResponse<null>>{ error: false, message: "OK" });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async changePassword(req: CustomRequest, res: Response) {
    try {
      const { password, oldPassword } = req.body;
      const user = await this.userRepo.findBy(<IUserDocument>{
        _id: req.client.id,
        removed: false,
      });
      if (!user || !user.IsValidPassword(oldPassword)) throw new ForbiddenException();
      await this.userRepo.update(user._id as string, <IUser>{ password });
      res.json(<IResponse<null>>{ error: false, message: "Password changed" });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async closeSession(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;
      let exist: ISessionDocument = null;
      if (id != "0") {
        exist = await this.sessionRepo.findBy(<ISessionDocument>{ _id: id, user: req.client.id });
        if (!exist) throw new NotFoundException(id);
      } else exist = await this.sessionRepo.findBy(<ISessionDocument>{ token: req.client.token });

      await this.sessionRepo.purge(exist._id as string);
      return res.json(<IResponse<null>>{ error: false, message: "removed" });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async sessionActive(req: CustomRequest, res: Response) {
    try {
      const { limit, skip } = this.pagination(req);
      const query = <ISession>{ removed: false, user: req.client.id };
      const [list, total] = await Promise.all([
        this.sessionRepo.list(
          <any>{ ...query, token: { $ne: req.client.token } },
          limit,
          skip,
          null,
          null,
          "-__v -token -removed -user"
        ),
        this.sessionRepo.count(query),
      ]);
      res.json(<IResponse<IList<ISession>>>{
        error: false,
        data: { list, total: total - 1 },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}

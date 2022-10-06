// @ts-nocheck
import * as express from "express";
import { Express, NextFunction, Request, Response, Router } from "express";
import { ICOption } from "./common/base/base";

export default class App {
  private app: Express;
  private port: number;

  constructor(appInit: {
    port: number;
    middleWares: Object[];
    controllers: ICOption[];
    services: Object[];
  }) {
    this.app = express();
    this.app.set("trust proxy", 1);
    this.port = appInit.port;

    this.middlewares(appInit.middleWares);
    this.routes(appInit.controllers);
  }

  private middlewares(middleWares: any[]): void {
    middleWares.forEach((middleware) => {
      this.app.use(middleware);
    });
  }

  private routes(controllers: ICOption[]): void {
    console.log("------ROUTES------");
    controllers.forEach((handler) => {
      const router = Router();
      this.app.use(`/api/${handler.versionPath}`, router);
      handler.controllers.forEach((controller) => new (controller as any)(this.app, router));

      router.stack.map((layer) => {
        const method = Object.keys(layer.route.methods)[0].toUpperCase().substring(0, 3);
        console.log(`[${method}]\t/api/${handler.versionPath}${layer.route.path}`);
      });
    });

    this.app.get("/", (req: Request, res: Response) => {
      res.send("Welcome");
    });

    this.app.get("*", (req: Request, res: Response, next: NextFunction) => {
      console.error(`Not Found: ${req.path}`);
      res.status(404).json({ error: true, message: "Not Found" });
    });
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Listening on http://localhost:${this.port}`);
    });
  }
}

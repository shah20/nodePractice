import 'reflect-metadata';
import { useExpressServer } from 'routing-controllers';
import config from 'config';
import express from 'express';
import { Service } from 'typedi';
import serverless from 'serverless-http';
import { DBHelperController, UserController } from './controllers';

export async function LambdaHandler(): Promise<serverless.Handler> {
  const app = new App();
  return serverless(app.expressApplication, { binary: ['application/zip'] });
}

const bootstrapApp = async (): Promise<void> => {
  const app = new App();
  return app.start();
};

@Service({ factory: bootstrapApp })
export class App {

  public readonly expressApplication: express.Application;

  constructor() {
    this.expressApplication = express();
    this.initializeControllers();
  }

  initializeControllers() {
    useExpressServer(this.expressApplication, {
      controllers: [DBHelperController, UserController],
    });
  }

  public async start() {
    const port = config.get('port');
    this.expressApplication.listen(port, () => {
      console.log(`Server is running on port:${port}`);
    });
  }
}

bootstrapApp();
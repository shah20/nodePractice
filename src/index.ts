// Legacy way to create an Express server
// import express from 'express';

// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Hello, TypeScript with Express!');
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

import 'reflect-metadata';
import { useExpressServer } from 'routing-controllers';
import { UserController } from './controllers/UserController';
import config from 'config';
import express from 'express';
import { Service } from 'typedi';
import serverless from 'serverless-http';

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
      controllers: [UserController],
    });
  }

  public async start() {
    const port = process.env.PORT || config.get('port');
    this.expressApplication.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}

bootstrapApp();
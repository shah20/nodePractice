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
import { createExpressServer } from 'routing-controllers';
import { UserController } from './controllers/UserController';
import config from 'config';

const port = process.env.PORT || config.get('port');

// creates express app, registers all controller routes and returns you express app instance
const app = createExpressServer({
  controllers: [UserController], // we specify controllers we want to use
});

// run express application on port 3000
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
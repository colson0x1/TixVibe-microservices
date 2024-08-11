import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
// Traffic has been proxied to our application through Ingress NGINX. Express
// is going to see the fact that stuff is being proxied and by default. Express
// by default doesn't really trust this HTTPS connection
// @ Make Express aware that its behind a Proxy of Ingress NGINX and to make sure
// it should still trust traffic as being secure even though its coming form
// that proxy
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    // Disables encryption
    signed: false,
    // Require that cookies will only be used if the user is visiting the
    // application over an HTTPS connection
    // secure: true,
    secure: process.env.NODE_ENV !== 'test',
  }),
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

/* app.all('*', async (req, res, next) => {
  next(new NotFoundError());
}); */

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

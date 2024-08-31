import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@tixvibe/common';
import { createTicketRouter } from './routes/new-ticket';
import { showTicketRouter } from './routes/show-ticket';
import { indexTicketRouter } from './routes/index-ticket';
import { updateTicketRouter } from './routes/update-ticket';

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
// Making sure we add this middleware after cookie-session. Because
// cookie-session has to run first so it can take a look at the cookie and
// set the `req.session` property else if we don't do that, whenever currentUser
// runs, it will be running to soon and req.session will not be set
// So now, if the user is authenticated, that will set the req.currentUser property
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

/* app.all('*', async (req, res, next) => {
  next(new NotFoundError());
}); */

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

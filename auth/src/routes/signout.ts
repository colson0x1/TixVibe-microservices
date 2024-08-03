import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  req.session = null;

  // Naturally we do still have to send back a response
  res.send({});
});

export { router as signoutRouter };

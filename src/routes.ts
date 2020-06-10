import express, { Request, Response } from 'express';
import UserController from './controller/UserController';

const auth = require('./security/auth');
const routes = express.Router();
const userController = new UserController();

routes.get('/users', userController.index);

routes.get('/users/:id', userController.show);
routes.post('/users', userController.store);
routes.post('/auth/login', userController.login);
routes.post('/auth/facebook/:fb_id', userController.facebookId)

routes.use(auth);
routes.get('/auth/me', userController.me);
routes.put('/users', userController.update);
routes.delete('/users', userController.delete);

export default routes;
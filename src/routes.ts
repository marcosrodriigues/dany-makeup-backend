import express, { Request, Response } from 'express';
import UserController from './controller/UserController';

const auth = require('./security/auth');
const routes = express.Router();
const userController = new UserController();

routes.get('/users', userController.index);
routes.get('/users/:id', userController.show);
routes.post('/users', userController.store);
routes.post('/users', userController.update);
routes.delete('/users', userController.delete);
routes.post('/users/login', userController.login)


routes.get('/', (request: Request, response: Response) => {
    return response.json({ message: 'Hello world!' });
})


routes.use(auth);
routes.get('/auth/me', userController.me);

export default routes;
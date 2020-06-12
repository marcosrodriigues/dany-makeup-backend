import express from 'express';

import multer from 'multer';
import MulterConfig from './config/multer';

const auth = require('./security/auth');
const routes = express.Router();
const uploads = multer(MulterConfig);

import UserController from './controller/UserController';
import CategoryController from './controller/CategoryController';

const userController = new UserController();
const categoryController = new CategoryController();

routes.get('/users', userController.index);

routes.get('/users/:id', userController.show);
routes.post('/users', userController.store);
routes.post('/auth/login', userController.login);
routes.post('/auth/facebook/:fb_id', userController.facebookId)

routes.get('/categorys', categoryController.index)
routes.get('/categorys/:id', categoryController.show)
routes.post('/categorys', uploads.single('image'), categoryController.store)
routes.put('/categorys', uploads.single('image'), categoryController.update)
routes.delete('/categorys/:id', categoryController.delete)

routes.use(auth);
routes.get('/auth/me', userController.me);
routes.put('/users', userController.update);
routes.delete('/users', userController.delete);

export default routes;

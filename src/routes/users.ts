import express from 'express';

import multer from 'multer';
import MulterConfig from '../config/multer';
import UserControlloer from '../controller/UserController';

const routes = express.Router();
const uploads = multer(MulterConfig);

const auth = require('../security/auth');

const controller = new UserControlloer();

routes.get('/users', controller.index);
routes.get('/users/:id', controller.show);
routes.post('/users', controller.store);
routes.put('/users', uploads.single('avatar_image'), controller.update);
routes.delete('/users', controller.delete);

routes.post('/auth/login', controller.login);
routes.post('/auth/facebook/:fb_id', controller.facebookId)

routes.get('/auth/me', auth, controller.me);

export default routes;
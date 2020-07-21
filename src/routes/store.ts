import express from 'express';

import multer from 'multer';
import MulterConfig from '../config/multer';
import StoreController from '../controller/StoreController';

const routes = express.Router();
const uploads = multer(MulterConfig);

const controller = new StoreController();

routes.get('/stores', controller.index)
routes.get('/stores/:id', controller.show)
routes.post('/stores', uploads.single('image'), controller.store)
routes.put('/stores', uploads.single('image'), controller.update)
routes.delete('/stores/:id', controller.delete)
routes.get('/mobile/stores', controller.mobile_store)

export default routes;
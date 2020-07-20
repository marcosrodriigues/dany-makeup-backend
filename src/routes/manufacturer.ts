import express from 'express';

import multer from 'multer';
import MulterConfig from '../config/multer';
import ManufacturerController from '../controller/ManufacturerController';

const routes = express.Router();
const uploads = multer(MulterConfig);

const controller = new ManufacturerController();

routes.get('/manufacturers', controller.index)
routes.get('/manufacturers/:id', controller.show)
routes.post('/manufacturers', uploads.single('image'), controller.store)
routes.put('/manufacturers', uploads.single('image'), controller.update)
routes.delete('/manufacturers/:id', controller.delete)

export default routes;
import express from 'express';

import multer from 'multer';
import MulterConfig from '../config/multer';
import BannerController from '../controller/BannerController';

const routes = express.Router();
const uploads = multer(MulterConfig);

const controller = new BannerController();

routes.get('/banners', controller.index)
routes.get('/banners', controller.index)
routes.get('/banners/:id', controller.show)
routes.post('/banners', uploads.single('image'), controller.store)
routes.put('/banners', uploads.single('image'), controller.update)
routes.delete('/banners/:id', controller.delete)

routes.get('/mobile/banners', controller.available)

export default routes;
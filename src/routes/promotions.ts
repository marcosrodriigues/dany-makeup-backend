import express from 'express';

import multer from 'multer';
import MulterConfig from '../config/multer';
import PromotionController from '../controller/PromotionController';

const routes = express.Router();
const uploads = multer(MulterConfig);

const controller = new PromotionController();

routes.get('/promotions', controller.index)
routes.get('/promotions/:id', controller.show)
routes.post('/promotions', uploads.array('files[]'), controller.store)
routes.put('/promotions', uploads.array('files[]'), controller.update)
routes.delete('/promotions/:id', controller.delete)

routes.get('/mobile/promotions', controller.available)

export default routes;
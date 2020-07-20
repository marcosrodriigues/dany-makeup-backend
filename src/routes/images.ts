import express from 'express';

import ImagesController from '../controller/ImagesController';

const routes = express.Router();

const controller = new ImagesController();

routes.get('/images/product/:id', controller.listByProduct)
routes.get('/images/promotion/:id', controller.listByPromotion)

export default routes;

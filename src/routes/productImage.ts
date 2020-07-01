import express from 'express';

import ProductImagesController from '../controller/ProductImagesController';

const routes = express.Router();

const controller = new ProductImagesController();

routes.get('/product_images/:id', controller.show)

export default routes;
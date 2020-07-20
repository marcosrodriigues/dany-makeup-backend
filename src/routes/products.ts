import express from 'express';

import multer from 'multer';
import MulterConfig from '../config/multer';
import ProductController from '../controller/ProductController';

const routes = express.Router();
const uploads = multer(MulterConfig);

const controller = new ProductController();

routes.get('/products', controller.index)
routes.get('/products/:id', controller.show)
routes.post('/products', uploads.array('images[]'), controller.store)
routes.put('/products', uploads.array('images[]'), controller.update)
routes.delete('/products/:id', controller.delete)

routes.get('/mobile/products', controller.list)

export default routes;
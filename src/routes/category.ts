import express from 'express';

import multer from 'multer';
import MulterConfig from '../config/multer';
import CategoryController from '../controller/CategoryController';

const routes = express.Router();
const uploads = multer(MulterConfig);

const controller = new CategoryController();

routes.get('/categorys', controller.index)
routes.get('/categorys/:id', controller.show)
routes.post('/categorys', uploads.single('image'), controller.store)
routes.put('/categorys', uploads.single('image'), controller.update)
routes.delete('/categorys/:id', controller.delete)

routes.get('/category_products', controller.categoryProduct)

export default routes;
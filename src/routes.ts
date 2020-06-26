import express from 'express';

import multer from 'multer';
import MulterConfig from './config/multer';

const auth = require('./security/auth');
const routes = express.Router();
const uploads = multer(MulterConfig);

import UserController from './controller/UserController';
import CategoryController from './controller/CategoryController';
import ProductController from './controller/ProductController';
import ManufacturerController from './controller/ManufacturerController';
import ProductImagesController from './controller/ProductImagesController';
import PromotionController from './controller/PromotionController';
import BannerController from './controller/BannerController';

const userController = new UserController();
const categoryController = new CategoryController();
const productController = new ProductController();
const manufacturerController = new ManufacturerController();
const productImagesController = new ProductImagesController();
const promotionController = new PromotionController();
const bannerController = new BannerController();

routes.get('/users', userController.index);

routes.get('/users/:id', userController.show);
routes.post('/users', userController.store);
routes.put('/users', userController.update);
routes.delete('/users', userController.delete);
routes.post('/auth/login', userController.login);
routes.post('/auth/facebook/:fb_id', userController.facebookId)

routes.get('/manufacturers', manufacturerController.index)
routes.get('/manufacturers/:id', manufacturerController.show)
routes.post('/manufacturers', uploads.single('image'), manufacturerController.store)
routes.put('/manufacturers', uploads.single('image'), manufacturerController.update)
routes.delete('/manufacturers/:id', manufacturerController.delete)

routes.get('/category_products', categoryController.categoryProduct)

routes.get('/categorys', categoryController.index)
routes.get('/categorys/:id', categoryController.show)
routes.post('/categorys', uploads.single('image'), categoryController.store)
routes.put('/categorys', uploads.single('image'), categoryController.update)
routes.delete('/categorys/:id', categoryController.delete)

routes.get('/products', productController.index)
routes.get('/products/:id', productController.show)
routes.post('/products', uploads.array('images[]'), productController.store)
routes.put('/products', uploads.array('images[]'), productController.update)
routes.delete('/products/:id', productController.delete)

routes.get('/promotions', promotionController.index)
routes.get('/promotions/:id', promotionController.show)
routes.post('/promotions', uploads.array('files[]'), promotionController.store)
routes.put('/promotions', uploads.array('files[]'), promotionController.update)
routes.delete('/promotions/:id', promotionController.delete)

routes.get('/banners', bannerController.index)
routes.get('/banners', bannerController.index)
routes.get('/banners/:id', bannerController.show)
routes.post('/banners', uploads.single('image'), bannerController.store)
routes.put('/banners', uploads.single('image'), bannerController.update)
routes.delete('/banners/:id', bannerController.delete)

routes.get('/product_images/:id', productImagesController.show)


routes.get('/mobile/banners', bannerController.available)
routes.get('/mobile/promotions', promotionController.available)
routes.get('/mobile/products', productController.list)


routes.use(auth);
routes.get('/auth/me', userController.me);

export default routes;


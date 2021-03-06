import express from 'express';
import './config/env';

import stores from './routes/store';
import manufacturers from './routes/manufacturer';
import categorys from './routes/category';
import images from './routes/images';
import products from './routes/products';
import promotions from './routes/promotions';
import banners from './routes/banners';
import correios from './routes/correios';
import users from './routes/users';
import address from './routes/address';
import creditcard from './routes/creditcard';
import orders from './routes/order'
import manager from './routes/manager'

const routes = express.Router();

routes.get('/', (req, res) => {
    return res.json({ message: 'Hello, DanyMakeUp! '})
})

routes.use(stores);
routes.use(manufacturers);
routes.use(categorys);
routes.use(images);
routes.use(products);
routes.use(promotions);
routes.use(banners);
routes.use(correios);
routes.use(users);
routes.use(address)
routes.use(creditcard)
routes.use(orders);
routes.use(manager)

export default routes;



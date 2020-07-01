import express from 'express';

import stores from './routes/store';
import manufacturers from './routes/manufacturer';
import categorys from './routes/category';
import products from './routes/products';
import promotions from './routes/promotions';
import banners from './routes/banners';
import correios from './routes/correios';

const routes = express.Router();

routes.use(stores);
routes.use(manufacturers);
routes.use(categorys);
routes.use(products);
routes.use(promotions);
routes.use(banners);
routes.use(correios);

export default routes;



import express from 'express';

import OrderController from '../controller/OrderController';

const routes = express.Router();
const controller = new OrderController();

routes.get('/orders', controller.index)
routes.get('/orders/:id', controller.show)
routes.get('/orders/user/:id', controller.byUser)
routes.post('/orders', controller.store)
routes.put('/orders/:id', controller.update);

routes.delete('/orders/:id', controller.delete)

export default routes;
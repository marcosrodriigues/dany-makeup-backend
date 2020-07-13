import express from 'express';

import AddressController from '../controller/AddressController';

const routes = express.Router();
const controller = new AddressController();

routes.post('/address/user', controller.store)
routes.put('/address/user', controller.update)
routes.get('/address/user/:user_id', controller.byUser)

routes.delete('/address/:id', controller.delete)

export default routes;
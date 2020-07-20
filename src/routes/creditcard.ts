import express from 'express';

import CreditCardController from '../controller/CreditCardController';

const routes = express.Router();
const controller = new CreditCardController();

routes.get('/credit_card/user/:user_id', controller.index)
routes.post('/credit_card/user', controller.store)
routes.delete('/credit_card/:id', controller.delete)

export default routes;
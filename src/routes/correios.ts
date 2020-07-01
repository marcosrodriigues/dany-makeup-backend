import express from 'express';

import CorreiosController from '../controller/CorreiosController';

const routes = express.Router();
const controller = new CorreiosController();

routes.get('/correios/frete', controller.frete)

export default routes;
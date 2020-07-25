import express from 'express';
import ManagerController from '../controller/ManagerController';

const routes = express.Router();

const controller = new ManagerController();

routes.post('/manager/auth', controller.auth);

export default routes;


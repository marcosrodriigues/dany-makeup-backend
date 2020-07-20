import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';
import { errors } from 'celebrate';
import dotenv from './config/env';

const app = express();

app.use(express.json());
app.use(cors());
app.use(dotenv)

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use(routes);

app.use(errors());

app.listen(3333);
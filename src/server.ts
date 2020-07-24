import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';
import { errors } from 'celebrate';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'https://manager.danymakeup.com.br'
}));

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use(routes);

app.use(errors());

app.listen(process.env.PORT || 3333);
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import mainRouter from './routes/mainRouter';
import gameRouter from './routes/game';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || '3000';

app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());

app.listen(PORT, (err: Error) => {
    if (err) throw err;

    logger.info(`Server is listening on port: ${PORT}`);
});

app.use('/', mainRouter);
app.use('/game', gameRouter);

import express from 'express';

import mainRouter from './routes/mainRouter';
import logger from './utils/logger';

const app = express();

const PORT = process.env.PORT || '3000';

app.listen(PORT, (err: Error) => {
    if (err) throw err;

    logger.info(`Server is listening on port: ${PORT}`);
});

app.use('/', mainRouter);

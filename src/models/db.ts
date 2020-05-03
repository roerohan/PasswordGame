import mongoose from 'mongoose';
import dotenv from 'dotenv';

import logger from '../utils/logger';

dotenv.config();

mongoose.Promise = global.Promise;

const passwordDB = mongoose.createConnection(`${process.env.MONGO_URL}/${process.env.PASSWORD_DB}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

passwordDB.once('open', () => {
    logger.info('Connected to Mongo Succesfully!');
});

export default passwordDB;

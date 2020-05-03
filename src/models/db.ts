import mongoose from 'mongoose';
import logger from '../utils/logger';

mongoose.Promise = global.Promise;

const passwordDB = mongoose.createConnection(`${process.env.MONGO_URL}/${process.env.PASSWORD_DB}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
});

passwordDB.once('open', () => {
    logger.info('Connected to Mongo Sucesfully!');
});

export default passwordDB;

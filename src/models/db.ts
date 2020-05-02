import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const passwordDB = mongoose.createConnection(`${process.env.MONGO_URL}/${process.env.PASSWORD_DB}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
});

passwordDB.once('open', () => {
    console.log('Connected to Mongo Sucesfully!');
});

export default passwordDB;

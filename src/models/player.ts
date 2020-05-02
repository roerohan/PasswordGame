import mongoose from 'mongoose';

export default new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        required: true,
        default: 0,
    }
});

export interface PlayerInterface extends mongoose.Document {
    username: string,
    points: number,
}
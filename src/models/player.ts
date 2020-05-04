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
    },
    creator: {
        type: Boolean,
        default: false,
    },
});

export interface PlayerInterface extends mongoose.Document {
    username: string,
    points: number,
    creator: boolean,
}

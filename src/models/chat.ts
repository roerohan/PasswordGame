import mongoose from 'mongoose';

export default new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    messages: new mongoose.Schema({
        username: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    }),
}, {
    timestamps: true,
});

export interface ChatInterface extends mongoose.Document {
    roomId: string;
    messages: { username: string, message: string };
}

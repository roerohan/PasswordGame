import mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

export default new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true,
    },
    messages: [messageSchema],
}, {
    timestamps: true,
});

export interface MessageInterface extends mongoose.Document {
    username: string;
    message: string;
}

export interface ChatInterface extends mongoose.Document {
    roomId: string;
    messages: MessageInterface[];
}

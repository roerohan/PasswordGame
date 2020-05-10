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

export const onlineSchema = new mongoose.Schema({
    socketId: {
        type: String,
        required: true,
    },
    username: {
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
    online: [onlineSchema],
}, {
    timestamps: true,
});

export interface MessageInterface extends mongoose.Document {
    username: string;
    message: string;
}

export interface OnlineInterface extends mongoose.Document {
    socketId: string;
    username: string;
}

export interface ChatInterface extends mongoose.Document {
    roomId: string;
    messages: MessageInterface[];
    online: OnlineInterface[];
}

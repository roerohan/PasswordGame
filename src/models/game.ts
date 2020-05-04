import mongoose from 'mongoose';
import playerSchema, { PlayerInterface } from './player';

export default new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true,
    },
    players: {
        type: [playerSchema],
        required: true,
    },
    access: {
        type: String,
        enum: ['public', 'private'],
        required: true,
    },
    rounds: {
        type: Number,
        required: true,
        default: 0,
    },
    hasStarted: {
        type: Boolean,
        required: true,
        default: false,
    },
    passwordHolder: String,
    password: String,
    usedPasswords: {
        type: [String],
        required: true,
    },
    creator: String,
});

export interface GameInterface extends mongoose.Document {
    roomId: string,
    players: Array<PlayerInterface>,
    access: 'public' | 'private',
    rounds: number,
    hasStarted: boolean,
    passwordHolder: string,
    password: string,
    usedPasswords: Array<string>,
    creator: string,
}

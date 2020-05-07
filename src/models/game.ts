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
    currentRound: {
        type: Number,
        required: true,
        default: 1,
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
    solvedBy: {
        type: [String],
        default: [],
    },
    creator: {
        type: String,
        required: true,
    },
    time: new mongoose.Schema({
        start: {
            type: String,
            required: true,
        },
        end: {
            type: String,
            required: true,
        },
    }),
    hints: [String],
});

export interface GameInterface extends mongoose.Document {
    roomId: string;
    players: Array<PlayerInterface>;
    access: 'public' | 'private';
    rounds: number;
    currentRound: number;
    hasStarted: boolean;
    passwordHolder: string;
    password: string;
    usedPasswords: Array<string>;
    solvedBy: Array<string>;
    creator: string;
    time: {start: number, end: number};
    hints: Array<string>;
}

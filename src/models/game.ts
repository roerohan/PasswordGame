import mongoose from 'mongoose';
import playerSchema, { PlayerInterface } from './player';

export default new mongoose.Schema({
    players: {
        type: [playerSchema],
        required: true,
    },
    hasStarted: {
        type: Boolean,
        required: true,
        default: false,
    },
    rounds: {
        type: Number,
        required: true,
        default: 3,
    },
    currentRound: {
        type: Number,
        required: true,
        default: 1,
    },
    roomId: {
        type: String,
        required: true,
        index: true,
    },
    access: {
        type: String,
        enum: ['public', 'private'],
        required: true,
        default: 'public',
    },
    passwordHolder: {
        type: String,
        default: '',
    },
    password: {
        type: String,
        default: '',
    },
    creator: {
        type: String,
        required: true,
    },
    usedPasswords: {
        type: [String],
        required: true,
    },
    solvedBy: {
        type: [String],
        default: [],
    },
    hints: {
        type: [String],
        default: [],
    },
    time:
    {
        type: new mongoose.Schema({
            start: {
                type: Number,
                required: true,
            },
            end: {
                type: Number,
                required: true,
            },
        }),
        default: { start: new Date().getTime(), end: new Date().getTime() },
    },
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
    time: { start: number, end: number };
    hints: Array<string>;
}

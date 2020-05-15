import { GameInterface } from '../models/game';
import messages from './messages';

const GUESSER_POINTS: number = process.env.GUESSER_POINTS ? Number(process.env.GUESSER_POINTS) : 50;
const HOLDER_POINTS: number = process.env.HOLDER_POINTS ? Number(process.env.HOLDER_POINTS) : 100;

export default function attempt(game: GameInterface, username: string, password: string) {
    const time = new Date().getTime();
    if (time > game.time.end) {
        return { modified: false, message: messages.timeOver };
    }

    if (password !== game.password) {
        return { modified: false, message: messages.incorrect };
    }

    if (username === game.passwordHolder) {
        return { modified: false, message: messages.serverError };
    }

    if (game.solvedBy.includes(username)) {
        return { modified: false, message: messages.alreadySolved };
    }

    const newGame = game;

    newGame.solvedBy.push(username);
    newGame.markModified('solvedBy');

    const noOfHints = game.hints.length === 0 ? 1 : game.hints.length;

    const timeDiff = game.time.end - time;
    const factor = (Math.sqrt(timeDiff) / 10000) / noOfHints;
    newGame.players = newGame.players.map((p) => {
        const play = p;
        if (play.username === username) {
            play.points += Math.floor(GUESSER_POINTS * factor);
        } else if (play.username === newGame.passwordHolder) {
            play.points += Math.floor(HOLDER_POINTS * ((Math.PI ** 2 * factor) / 10));
        }
        return play;
    });

    return { modified: true, message: messages.correct, newGame };
}

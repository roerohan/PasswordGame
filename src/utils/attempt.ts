import { GameInterface } from '../models/game';
import messages from './messages';

const GUESSER_POINTS: number = process.env.GUESSER_POINTS
    ? Number(process.env.GUESSER_POINTS) : 150;
const HOLDER_POINTS: number = process.env.HOLDER_POINTS
    ? Number(process.env.HOLDER_POINTS) : 50;

export default function attempt(game: GameInterface, username: string, word: string) {
    const password = word.toLowerCase();
    const time = new Date().getTime();

    if (time > game.time.end) {
        return { modified: false, message: messages.timeOver };
    }

    if (password.includes(game.password) && password !== game.password) {
        return { modified: false, message: messages.serverError };
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
    const noOfPlayers = game.players.length - 1;
    const timeDiff = game.time.end - time;

    const holderFactor = ((timeDiff / 1000) ** 3) / (noOfHints * noOfPlayers * 1000);
    const guesserFactor = ((timeDiff / 10000) ** 2) / (noOfHints * 25);

    newGame.players = newGame.players.map((p) => {
        const play = p;
        if (play.username === username) {
            play.points += GUESSER_POINTS + Math.floor(guesserFactor);
        } else if (play.username === newGame.passwordHolder) {
            play.points += HOLDER_POINTS + Math.floor(holderFactor);
        }
        return play;
    });

    return { modified: true, message: messages.correct, newGame };
}

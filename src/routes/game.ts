import express from 'express';

import { Game } from '../models/models';
import wordGenerator from '../utils/wordGenerator';
import messages from '../utils/messages';
import getNextPasswordHolder from '../utils/getNextPasswordHolder';

const router = express.Router();

let GUESSER_POINTS: number;
let HOLDER_POINTS: number;


if (process.env.GUESSER_POINTS) GUESSER_POINTS = Number(process.env.GUESSER_POINTS);
if (process.env.HOLDER_POINTS) HOLDER_POINTS = Number(process.env.HOLDER_POINTS);
else if (!process.env.GUESSER_POINTS) {
    GUESSER_POINTS = 50;
    HOLDER_POINTS = 100;
}

router.post('/start', async (req: express.Request, res: express.Response) => {
    const {
        roomId,
        username,
        access,
        rounds,
    } = req.body;

    if (!username) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }

    if (game.creator !== username) {
        res.json({ success: false, message: messages.notAdmin });
        return;
    }

    if (game.players.length < 2) {
        res.json({ success: false, message: messages.notEnoughPlayers });
        return;
    }

    game.access = access || game.access;
    game.rounds = rounds || game.rounds;

    game.hasStarted = true;
    await game.save();

    res.json({
        success: true,
        message: {
            players: game.players,
            hasStarted: game.hasStarted,
            rounds: game.rounds,
            currentRound: game.currentRound,
        },
    });
});


router.post('/next', async (req: express.Request, res: express.Response) => {
    const { roomId, username } = req.body;

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    if (!game.hasStarted) {
        res.json({ success: false, message: messages.gameNotStarted });
        return;
    }

    if (!game.players.find((player) => player.username === username)) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }
    if (game.time.end > new Date().getTime()) {
        const previousPassword = game.usedPasswords.length > 1 ? game.usedPasswords.slice(-2)[0] : '';
        res.json({
            success: true,
            message: {
                players: game.players,
                currentRound: game.currentRound,
                passwordHolder: game.passwordHolder,
                passwordLength: game.password.length,
                previousPassword,
                roundEnd: game.time.end,
            },
        });
        return;
    }

    const { passwordHolder } = game;

    const { nextPasswordHolder, currentRound } = getNextPasswordHolder(passwordHolder, game);
    game.currentRound = currentRound;

    if (game.currentRound > game.rounds) {
        res.json({ success: false, message: messages.gameEnded });
        return;
    }

    let password = wordGenerator();

    while (game.usedPasswords.includes(password)) {
        password = wordGenerator();
    }

    const previousPassword = game.password || '';

    const date: Date = new Date();
    const time = date.getTime();
    const DURATION = parseInt(process.env.DURATION, 10) || 60;

    game.time.start = time;
    game.time.end = time + (DURATION * 1000);
    game.password = password;
    game.passwordHolder = nextPasswordHolder;
    game.usedPasswords.push(password);
    game.markModified('usedPasswords');
    game.solvedBy = [];
    game.markModified('solvedBy');
    game.hints = [];
    game.markModified('hints');

    await game.save();

    res.json({
        success: true,
        message: {
            players: game.players,
            currentRound: game.currentRound,
            passwordHolder: nextPasswordHolder,
            passwordLength: password.length,
            previousPassword,
            roundEnd: game.time.end,
        },
    });
});


router.post('/attempt', async (req: express.Request, res: express.Response) => {
    const {
        roomId,
        username,
        password,
    } = req.body;

    if (!username) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    if (!game.hasStarted) {
        res.json({ success: false, message: messages.gameNotStarted });
        return;
    }

    const date: Date = new Date();
    if (date.getTime() > game.time.end) {
        res.json({ success: true, message: messages.timeOver });
        return;
    }

    if (password !== game.password) {
        res.json({ success: true, message: messages.incorrect });
        return;
    }

    if (username === game.passwordHolder) {
        res.json({ success: false, message: messages.serverError });
        return;
    }

    if (game.solvedBy.includes(username)) {
        res.json({ success: false, message: messages.alreadySolved });
        return;
    }

    game.solvedBy.push(username);
    game.markModified('solvedBy');

    game.players = game.players.map((p) => {
        const play = p;
        if (play.username === username) {
            play.points += GUESSER_POINTS;
        } else if (play.username === game.passwordHolder) {
            play.points += HOLDER_POINTS;
        }
        return play;
    });

    await game.save();

    res.json({
        success: true,
        message: {
            players: game.players,
            currentRound: game.currentRound,
            passwordHolder: game.passwordHolder,
            solvedBy: game.solvedBy,
        },
    });
});


router.post('/hint', async (req: express.Request, res: express.Response) => {
    const {
        roomId,
        username,
        hint,
    } = req.body;

    if (!username) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    if (!game.hasStarted) {
        res.json({ success: false, message: messages.gameNotStarted });
        return;
    }

    const date: Date = new Date();
    if (date.getTime() > game.time.end) {
        res.json({ success: true, message: messages.timeOver });
        return;
    }

    if (username !== game.passwordHolder) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }

    game.hints.push(hint);
    game.markModified('hints');

    await game.save();

    res.json({
        success: true,
        message: {
            hints: game.hints,
            passwordHolder: game.passwordHolder,
        },
    });
});


router.post('/end', async (req: express.Request, res: express.Response) => {
    const { roomId } = req.body;

    const game = await Game.findOneAndDelete({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    if (!game.hasStarted) {
        res.json({ success: false, message: messages.gameNotStarted });
        return;
    }

    res.json({
        success: true,
        message: {
            currentRound: game.currentRound,
            rounds: game.rounds,
            players: game.players,
        },
    });
});

export default router;

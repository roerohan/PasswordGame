import express from 'express';

import { Game } from '../models/models';
import wordGenerator, { words } from '../utils/wordGenerator';
import messages from '../utils/messages';
import getNextPasswordHolder from '../utils/getNextPasswordHolder';

const router = express.Router();

const MAX_HINTS = process.env.MAX_HINTS ? Number(process.env.MAX_HINTS) : 4;
const MAX_HINT_LENGTH = process.env.MAX_HINT_LENGTH ? Number(process.env.MAX_HINT_LENGTH) : 25;

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

    if (rounds && rounds < 10 && rounds > 0) {
        game.rounds = rounds;
    }

    if (access && ['public', 'private'].includes(access)) {
        game.access = access;
    }

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
    if (game.solvedBy.length !== (game.players.length - 1)
        && new Date().getTime() < game.time.end) {
        const previousPassword = game.usedPasswords.length > 1 ? game.usedPasswords.slice(-2)[0] : '';
        const currentPassword = username === game.passwordHolder ? game.password : '';

        res.json({
            success: true,
            message: {
                players: game.players,
                currentRound: game.currentRound,
                rounds: game.rounds,
                passwordHolder: game.passwordHolder,
                passwordLength: game.password.length,
                previousPassword,
                currentPassword,
                hints: game.hints,
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

    if (words.length > game.usedPasswords.length) {
        while (game.usedPasswords.includes(password)) {
            password = wordGenerator();
        }
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

    const currentPassword = username === game.passwordHolder ? game.password : '';

    res.json({
        success: true,
        message: {
            players: game.players,
            currentRound: game.currentRound,
            rounds: game.rounds,
            passwordHolder: nextPasswordHolder,
            passwordLength: password.length,
            previousPassword,
            currentPassword,
            hints: game.hints,
            roundEnd: game.time.end,
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
        res.json({ success: false, message: messages.timeOver });
        return;
    }

    if (game.hints.length >= MAX_HINTS) {
        res.json({ success: false, message: messages.maxHints });
        return;
    }

    if (hint.length > MAX_HINT_LENGTH || hint.indexOf(' ') !== -1) {
        res.json({ success: false, message: messages.hintInvalid });
    }

    if (username !== game.passwordHolder) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }

    if (hint === game.password) {
        res.json({ success: false, message: messages.serverError });
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

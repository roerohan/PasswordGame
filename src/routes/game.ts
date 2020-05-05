import express from 'express';

import { Game } from '../models/models';
import wordGenerator from '../utils/wordGenerator';
import messages from '../utils/messages';

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
    const { roomId, username } = req.body;

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

    game.hasStarted = true;
    await game.save();

    res.json({ success: true, message: messages.gameStarted });
});


router.post('/next', async (req: express.Request, res: express.Response) => {
    const { roomId, passwordHolder } = req.body;

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    if (!game.hasStarted) {
        res.json({ success: false, message: messages.gameNotStarted });
        return;
    }

    if (game.currentRound >= game.rounds) {
        res.json({ success: false, message: messages.gameEnded });
        return;
    }

    let password = wordGenerator();

    while (game.usedPasswords.includes(password)) {
        password = wordGenerator();
    }

    const playerIndex = passwordHolder
        ? game.players.findIndex((player) => player.username === passwordHolder) : 0;

    let nextPasswordHolder;
    if (playerIndex === game.players.length - 1) {
        [nextPasswordHolder] = game.players;
    } else {
        nextPasswordHolder = game.players[playerIndex + 1];
    }

    game.password = password;
    game.passwordHolder = nextPasswordHolder.username;
    game.currentRound += 1;
    game.usedPasswords.push(password);
    game.markModified('usedPasswords');
    game.solvedBy = [];
    game.markModified('solvedBy');

    await game.save();

    res.json({
        success: true,
        message: { passwordHolder: nextPasswordHolder, passwordLength: password.length },
    });
});


router.post('/attempt', async (req: express.Request, res: express.Response) => {
    const {
        roomId,
        username,
        password,
    } = req.body;

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    if (!game.hasStarted) {
        res.json({ success: false, message: messages.gameNotStarted });
        return;
    }

    if (password !== game.password) {
        res.json({ success: true, message: messages.incorrect });
        return;
    }

    if (!username) {
        res.json({ success: false, message: messages.userNotFound });
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

    res.json({ success: true, message: messages.correct });
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
            players: game.players,
        },
    });
});

export default router;

import express from 'express';

import { Game } from '../models/models';
import wordGenerator from '../utils/wordGenerator';
import messages from '../utils/messages';

const router = express.Router();

let GUESSER_POINTS: number; let
    HOLDER_POINTS: number;
if (process.env.GUESSER_POINTS) GUESSER_POINTS = Number(process.env.GUESSER_POINTS);
if (process.env.HOLDER_POINTS) HOLDER_POINTS = Number(process.env.HOLDER_POINTS);
else if (!process.env.GUESSER_POINTS) {
    GUESSER_POINTS = 50;
    HOLDER_POINTS = 100;
}

router.post('/start', async (req: express.Request, res: express.Response) => {
    const { roomId } = req.body;

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }

    game.hasStarted = true;
    await game.save();

    res.json({ success: true, message: messages.gameStarted });
});


router.post('/nextPasswordHolder', async (req: express.Request, res: express.Response) => {
    const { roomId, passwordHolder } = req.body;

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    if (!game.players.length) {
        res.json({ success: false, message: messages.noPlayers });
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
    game.usedPasswords.push(password);
    game.markModified('usedPasswords');

    await game.save();

    res.json({ success: true, message: { password, passwordHolder: nextPasswordHolder } });
});

router.post('/attempt', async (req: express.Request, res: express.Response) => {
    const {
        roomId,
        passwordHolder,
        player,
        password,
    } = req.body;

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    if (!game.players.length) {
        res.json({ success: false, message: messages.noPlayers });
        return;
    }

    if (password !== game.password) {
        res.json({ success: true, message: messages.incorrect });
        return;
    }

    game.players = game.players.map((p) => {
        const play = p;
        if (play.username === player) {
            play.points += GUESSER_POINTS;
        } else if (play.username === passwordHolder) {
            play.points += HOLDER_POINTS;
        }
        return play;
    });

    await game.save();

    res.json({ success: true, message: messages.correct });
});

export default router;

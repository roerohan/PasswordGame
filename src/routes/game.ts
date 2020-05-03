import express from 'express';

import { Game } from '../models/models';
import wordGenerator from '../utils/wordGenerator';
import messages from '../utils/messages';

const router = express.Router();

router.post('/start', async (req: express.Request, res: express.Response) => {
    const { roomId } = req.body;

    const game = await Game.updateOne({ roomId }, { hasStarted: true });

    if (!game.nModified) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }

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

export default router;

import express from 'express';

import { Game } from '../models/models';
import wordGenerator from '../utils/wordGenerator';

const router = express.Router();

router.post('/start', async (req: express.Request, res: express.Response) => {
    const { roomId } = req.body;

    const game = await Game.updateOne({ roomId }, { hasStarted: true });

    if (!game.nModified) {
        res.json({ success: false, message: 'gameNotFound' });
        return;
    }

    res.json({ success: true, message: 'gameStarted' });
});


router.post('/generatePassword', async (req: express.Request, res: express.Response) => {
    const { roomId } = req.body;

    const game = await Game.findOne({ roomId });

    if (!game) {
        res.json({ success: false, message: 'gameNotFound' });
        return;
    }

    let password = wordGenerator();

    while (game.usedPasswords.includes(password)) {
        password = wordGenerator();
    }

    game.password = password;
    game.usedPasswords.push(password);
    game.markModified('usedPasswords');

    await game.save();

    res.json({ success: true, message: password });
});

export default router;

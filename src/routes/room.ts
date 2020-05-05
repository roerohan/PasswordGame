import express from 'express';
import cryptoRandomString from 'crypto-random-string';
import { Game, Player } from '../models/models';
import messages from '../utils/messages';

const router = express.Router();

const ROUNDS = process.env.ROUNDS || 3;

router.post('/create', async (req: express.Request, res: express.Response) => {
    const { username } = req.body;

    const access = req.body.access ? req.body.access : 'public';
    const rounds = req.body.rounds ? req.body.rounds : ROUNDS;

    if (!username) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }

    if (!(/^[a-zA-Z0-9._-]{3,20}$/.test(username))) {
        res.json({ success: false, message: messages.usernameInvalid });
        return;
    }

    const roomId: string = cryptoRandomString({ length: 6 });
    const player = new Player({
        username,
    });

    const game = new Game({
        roomId,
        players: [player],
        access,
        rounds,
        creator: username,
    });

    await game.save();

    res.json({ success: true, message: messages.roomCreated });
});

router.get('/join/:roomId', async (req: express.Request, res: express.Response) => {
    const { username } = req.query;
    let { roomId } = req.params;

    if (!roomId) {
        const n: number = await Game.count({ access: 'public' });
        const r: number = Math.floor(Math.random() * n);
        const element = await Game.find({ access: 'public' }).limit(1).skip(r);
        [{ roomId }] = element;
    }

    if (!username) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }

    if (!(/^[a-zA-Z0-9._-]{3,20}$/.test(username.toString()))) {
        res.json({ success: false, message: messages.usernameInvalid });
        return;
    }

    const game = await Game.findOne({ roomId });
    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }
    let i;
    for (i = 0; i < game.players.length; i += 1) {
        if (game.players[i].username === username) {
            res.json({ success: false, message: messages.usernameAlreadyExists });
            return;
        }
    }


    const player = new Player({
        username,
    });


    game.players.push(player);
    game.markModified('players');

    await game.save();

    res.json({ success: true, message: messages.playerAdded });
});


export default router;

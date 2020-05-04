import express from 'express';
import cryptoRandomString from 'crypto-random-string';
import { Game, Player } from '../models/models';
import messages from '../utils/messages';


const { ROUNDS } = process.env;

const router = express.Router();

router.get('/create', async (req: express.Request, res: express.Response) => {
    const { username } = req.query;

    const access = req.query.access ? req.query.access : 'public';
    let { rounds } = req.query;
    if (!username) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }
    if (!rounds) {
        rounds = ROUNDS;
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
    });
    await game.save();
    if (!game) {
        res.json({ success: false, message: messages.serverError });
    } else {
        res.json({ success: true, message: messages.roomCreated });
    }
});

router.get('/join/:roomId', async (req: express.Request, res: express.Response) => {
    const { username } = req.query;
    let { roomId } = req.params;
    if (!roomId) {
        const n: number = await Game.count({ access: 'public' });
        const r: number = Math.floor(Math.random() * n);
        const element = await Game.find({ access: 'public' }).limit(1).skip(r);
        roomId = element[0].roomId;
    }
    if (!username) {
        res.json({ success: false, message: messages.userNotFound });
        return;
    }
    const player = new Player({
        username,
    });
    const game = await Game.findOne({ roomId });
    if (!game) {
        res.json({ success: false, message: messages.gameNotFound });
        return;
    }

    game.players.push(player);
    await game.save();
    res.json({ success: true, message: messages.playerAdded });
});


export default router;

import express from 'express';
import cryptoRandomString from 'crypto-random-string';
import { Game, Player } from '../models/models';


const router = express.Router();

router.get('/create', async (req: express.Request, res: express.Response) => {
    const { username, access, rounds } = req.query;
    const roomId: string = await cryptoRandomString({ length: 6 });
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
    res.json({ success: true, message: 'roomCreated' });
});

router.get('/join/:roomId', async (req: express.Request, res: express.Response) => {
    const { username } = req.query;
    const { roomId } = req.params;
    const player = new Player({
        username,
    });
    const game = await Game.findOne({ roomId });
    game.players.push(player);
    await Game.findOneAndUpdate({ roomId }, { players: game.players });
    res.json({ success: true, message: 'playerAdded' });
});


export default router;

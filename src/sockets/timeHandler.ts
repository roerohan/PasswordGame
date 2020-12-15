import socketio from 'socket.io';

import words from '../utils/words';
import { Game } from '../models/models';
import wordGenerator from '../utils/wordGenerator';
import liveGames from '../utils/liveGames';
import getNextPasswordHolder from '../utils/getNextPasswordHolder';

const DURATION = process.env.DURATION ? Number(process.env.DURATION) : 60;

export default async function timeHandler(
    data: { roomId: string },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId } = data;

    const game = await Game.findOne({ roomId });

    if (!game || !game.hasStarted) {
        return;
    }

    const { passwordHolder } = game;

    const { nextPasswordHolder, currentRound } = getNextPasswordHolder(passwordHolder, game);
    game.currentRound = currentRound;

    if (game.currentRound > game.rounds) {
        game.players = game.players.map((player) => {
            const p = player;
            p.points = 0;
            return p;
        });
        game.hasStarted = false;
        game.rounds = 3;
        game.currentRound = 1;
        game.password = '';
        game.passwordHolder = '';
        game.usedPasswords = [];
        game.time.start = new Date().getTime();
        game.time.end = new Date().getTime();
        game.markModified('usedPasswords');
        game.solvedBy = [];
        game.markModified('solvedBy');
        game.hints = [];
        game.markModified('hints');

        await game.save();
        return;
    }

    let password = wordGenerator();

    if (words.length > game.usedPasswords.length) {
        while (game.usedPasswords.includes(password)) {
            password = wordGenerator();
        }
    }

    password = password.toLowerCase();

    const date: Date = new Date();
    const time = date.getTime();

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

    io.of(namespace).in(roomId).emit('next');

    liveGames.setGame(roomId, setTimeout(() => {
        timeHandler({ roomId }, io, namespace);
    }, DURATION * 1000));
}

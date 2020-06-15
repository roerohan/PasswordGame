import socketio from 'socket.io';

import { Game } from '../models/models';
import { PlayerInterface } from '../models/player';
import attempt from '../utils/attempt';
import messages from '../utils/messages';
import timeHandler from './timeHandler';

export async function onStart(
    data: { roomId: string },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId } = data;

    const game = await Game.findOne({ roomId });

    if (!game) {
        return;
    }

    if (!game.hasStarted) {
        return;
    }

    timeHandler(data, io, namespace);

    io.of(namespace).in(roomId).emit('start', {
        hasStarted: true,
        roomId,
    });
}

export function onJoin(
    data: { roomId: string, players: PlayerInterface[] },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId, players } = data;

    if (!roomId || !players || !players.length) {
        return;
    }

    io.of(namespace).in(roomId).emit('join', {
        players,
    });
}

export async function onHint(
    data: { roomId: string, username: string, hints: string[], passwordHolder: string },
    io: socketio.Server,
    namespace: string,
) {
    const {
        roomId, username, hints, passwordHolder,
    } = data;

    if (!roomId || !username) return;

    if (username !== passwordHolder) return;

    io.of(namespace).in(roomId).emit('hint', { hints, passwordHolder });
}

export async function onAttempt(
    data: { roomId: string, username: string, message: string },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId, username, message } = data;

    if (!message || !username || !roomId) return false;

    const game = await Game.findOne({ roomId });

    if (!game) return false;

    const { modified, message: reply, newGame } = attempt(game, username, message);

    if (modified) await newGame.save();

    if (reply === messages.serverError || reply === messages.alreadySolved) return true;

    if (reply !== messages.correct) {
        return false;
    }

    io.of(namespace).in(roomId).emit('message', {
        username,
        message: reply,
        time: new Date(),
    });

    io.of(namespace).in(roomId).emit('correct', {
        players: newGame.players,
        solvedBy: newGame.solvedBy,
    });

    return true;
}

export async function onDisconnect(
    data: { roomId: string, username: string },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId, username } = data;

    if (!roomId || !username) return;

    const game = await Game.findOne({ roomId });
    game.players = game.players.filter((player) => (player.username !== username));

    if (game.players.length === 0) {
        await game.remove();
        return;
    }
    if (game.creator === username) {
        game.creator = game.players[0].username;
    }
    const { passwordHolder } = game;
    if (game.passwordHolder === username) {
        io.of(namespace).in(roomId).emit('next');
    }
    game.markModified('players');

    await game.save();

    io.of(namespace).in(roomId).emit('disconnect', {
        username,
        creator: game.creator,
        passwordHolder,
    });
}

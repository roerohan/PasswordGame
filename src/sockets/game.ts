import socketio from 'socket.io';

import { Game } from '../models/models';
import { PlayerInterface } from '../models/player';

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

    io.of(namespace).in(roomId).emit('start', {
        hasStarted: true,
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
    data: { roomId: string, username: string },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId, username } = data;

    if (!roomId || !username) return;

    const { hints, passwordHolder } = await Game.findOne({ roomId });

    if (username !== passwordHolder) return;

    io.of(namespace).in(roomId).emit('hint', { hints, passwordHolder });
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
    game.markModified('players');

    await game.save();

    io.of(namespace).in(roomId).emit('disconnect', {
        username,
        creator: game.creator,
    });
}

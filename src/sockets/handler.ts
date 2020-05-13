
import socketio from 'socket.io';
import logger from '../utils/logger';

import {
    onJoin,
    onMessage,
    onDisconnect,
} from './chat';
import {
    onStart,
    onJoin as joinGame,
    onDisconnect as disconnectGame,
    onHint,
} from './game';

export default function socketHandler(io: socketio.Server) {
    const namespace = '';
    io.of(namespace).on('connection', (socket: socketio.Socket) => {
        logger.info(`Connected ${socket.id}`);

        socket.on('join', async (data) => {
            logger.info(`${socket.id} Joined room ${data.roomId}`);
            await onJoin(socket, data, io, namespace);
            joinGame(data, io, namespace);
        });

        socket.on('message', async (data) => {
            await onMessage(socket, data, io, namespace);
        });

        socket.on('start', async (data) => {
            await onStart(data, io, namespace);
        });

        socket.on('hint', async (data) => {
            await onHint(data, io, namespace);
        });

        socket.on('disconnect', async () => {
            logger.info(`Disconnected ${socket.id}`);
            const data = await onDisconnect(socket, io, namespace);
            await disconnectGame(data, io, namespace);
        });
    });
}

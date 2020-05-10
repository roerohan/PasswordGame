import socketio from 'socket.io';
import logger from '../utils/logger';
import {
    Chat, Message, Game, Online,
} from '../models/models';
import messages from '../utils/messages';

async function onJoin(
    socket: socketio.Socket,
    data: { roomId: string, username: String },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId, username } = data;

    const chat = await Chat.findOne({ roomId });

    const message = new Message({
        username,
        message: messages.joinedRoom,
    });

    const online = new Online({
        socketId: socket.id,
        username,

    });

    if (!chat) {
        const game = await Game.findOne({ roomId });

        if (!game) {
            return;
        }

        const newChat = new Chat({
            roomId,
            messages: [message],
            online: [online],
        });

        await newChat.save();
    } else {
        chat.messages.push(message);
        chat.markModified('messages');
        chat.online.push(online);
        chat.markModified('online');
        await chat.save();
    }

    socket.join(roomId);
    io.of(namespace).in(roomId).emit('message', {
        username,
        message: messages.joinedRoom,
        time: new Date(),
    });
}

async function onMessage(
    socket: socketio.Socket,
    data: { roomId: string, username: string, message: string },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId, username, message } = data;

    if (!message) return;

    const chat = await Chat.findOne({ roomId });

    if (!chat) {
        socket.emit('err', { message: messages.noRooms });
        return;
    }

    const msg = new Message({
        username,
        message,
    });

    chat.messages.push(msg);
    chat.markModified('messages');
    await chat.save();

    io.of(namespace).in(roomId).emit('message', {
        username,
        message,
        time: new Date(),
    });
}

async function onDisconnect(
    socket: socketio.Socket,
    io: socketio.Server,
    namespace: string,
) {
    const chat = await Chat.findOne({ online: { $elemMatch: { socketId: socket.id } } });
    const online = chat.online.find((obj) => (obj.socketId === socket.id));
    const { username } = online;
    const newonline = chat.online.filter((obj) => (obj.socketId !== socket.id));
    chat.online = newonline;
    await chat.save();
    const game = await Game.findOne({ players: { $elemMatch: { username } } });
    const newplayers = game.players.filter((player) => (player.username !== username));
    if (game.creator === username) {
        game.creator = newplayers[0].username;
    }
    game.players = newplayers;
    await game.save();
    io.of(namespace).in(chat.roomId).emit('message', {
        username,
        message: messages.disconnected,
        time: new Date(),
    });
}

export default function chatSockets(io: socketio.Server) {
    const namespace = '/chat';
    io.of(namespace).on('connection', (socket: socketio.Socket) => {
        logger.info(`Connected ${socket.id}`);

        socket.on('join', async (data) => {
            logger.info('Joined room.');
            await onJoin(socket, data, io, namespace);
        });

        socket.on('message', async (data) => {
            onMessage(socket, data, io, namespace);
        });

        socket.on('disconnect', () => {
            logger.info('Disconnected');
            onDisconnect(socket, io, namespace);
        });
    });
}

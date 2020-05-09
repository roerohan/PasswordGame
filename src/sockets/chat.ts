import socketio from 'socket.io';
import logger from '../utils/logger';
import { Chat, Message, Game } from '../models/models';
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

    if (!chat) {
        const game = await Game.findOne({ roomId });

        if (!game) {
            return;
        }

        const newChat = new Chat({
            roomId,
            messages: [message],
        });

        await newChat.save();
    } else {
        chat.messages.push(message);
        chat.markModified('messages');
        await chat.save();
    }

    socket.join(roomId);
    io.of(namespace).in(roomId).emit('message', {
        username,
        message: messages.joinedRoom,
    });
}

async function onMessage(
    socket: socketio.Socket,
    data: { roomId: string, username: string, message: string },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId, username, message } = data;

    const chat = await Chat.findOne({ roomId });

    if (!chat) {
        socket.emit('error', { message: messages.noRooms });
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
    });
}

function onDisconnect(
    data: { roomId: string, username: string },
    io: socketio.Server,
    namespace: string,
) {
    const { roomId, username } = data;

    io.of(namespace).in(roomId).emit('message', {
        username,
        message: messages.disconnected,
    });
}

export default function chatSockets(io: socketio.Server) {
    const namespace = '/chat';
    io.of(namespace).on('connection', (socket: socketio.Socket) => {
        logger.info(`Connected ${socket.id}`);

        socket.on('join', async (data) => {
            await onJoin(socket, data, io, namespace);
        });

        socket.on('message', async (data) => {
            onMessage(socket, data, io, namespace);
        });

        socket.on('disconnect', (data) => {
            onDisconnect(data, io, namespace);
        });
    });
}

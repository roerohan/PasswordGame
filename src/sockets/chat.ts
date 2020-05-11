import socketio from 'socket.io';
import {
    Chat, Message, Game, Online,
} from '../models/models';
import messages from '../utils/messages';

export async function onJoin(
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

export async function onMessage(
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

export async function onDisconnect(
    socket: socketio.Socket,
    io: socketio.Server,
    namespace: string,
) {
    const chat = await Chat.findOne({ online: { $elemMatch: { socketId: socket.id } } });
    if (!chat) {
        return { roomId: '', username: '' };
    }

    const { roomId } = chat;

    const { username } = chat.online.find((obj) => (obj.socketId === socket.id));
    chat.online = chat.online.filter((obj) => (obj.socketId !== socket.id));

    if (chat.online.length === 0) {
        await chat.remove();
        return { roomId, username };
    }
    chat.markModified('online');
    await chat.save();

    io.of(namespace).in(roomId).emit('message', {
        username,
        message: messages.disconnected,
        time: new Date(),
    });

    return { roomId, username };
}

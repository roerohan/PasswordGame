import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import mainRouter from './routes/mainRouter';
import gameRouter from './routes/game';
import roomRouter from './routes/room';
import chat from './sockets/chat';
import logger from './utils/logger';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || '3000';

if (process.env.NODE_ENV === 'dev') {
    app.use(cors());
}

app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());

app.use('/', mainRouter);
app.use('/game', gameRouter);
app.use('/room', roomRouter);

chat(io);

server.listen(PORT, () => {
    logger.info(`Server is listening on port: ${PORT}`);
});

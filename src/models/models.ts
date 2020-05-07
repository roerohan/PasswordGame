import { Model } from 'mongoose';

import passwordDb from './db';
import playerSchema, { PlayerInterface } from './player';
import gameSchema, { GameInterface } from './game';
import chatSchema, { ChatInterface } from './chat';

export const Player: Model<PlayerInterface> = passwordDb.model('Player', playerSchema);
export const Game: Model<GameInterface> = passwordDb.model('Game', gameSchema);
export const Chat: Model<ChatInterface> = passwordDb.model('Chat', chatSchema);

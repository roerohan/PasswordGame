import { Model } from 'mongoose';

import passwordDb from './db';
import playerSchema, { PlayerInterface } from './player';
import gameSchema, { GameInterface } from './game';

export const Player: Model<PlayerInterface> = passwordDb.model('Player', playerSchema);
export const Game: Model<GameInterface> = passwordDb.model('Game', gameSchema);

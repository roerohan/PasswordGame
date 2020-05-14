import { GameInterface } from '../models/game';

export default function getNextPasswordHolder(passwordHolder: string, game: GameInterface) {
    const playerIndex = passwordHolder
        ? game.players.findIndex((player) => player.username === passwordHolder) : -1;

    let nextPasswordHolder; let
        currentRound;
    if (playerIndex === game.players.length - 1) {
        [nextPasswordHolder] = game.players;
        currentRound = game.currentRound + 1;
    } else {
        nextPasswordHolder = game.players[playerIndex + 1];
    }

    return {
        nextPasswordHolder: nextPasswordHolder.username,
        currentRound,
    };
}

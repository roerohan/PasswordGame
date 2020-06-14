let liveGames: { [key: string]: { timeout: NodeJS.Timeout } };

export function getLiveGames() {
    return liveGames;
}

export function setLiveGames(lg: { [key: string]: { timeout: NodeJS.Timeout } }) {
    liveGames = lg;
}

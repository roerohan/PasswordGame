class LiveGames {
    private games: { [roomId: string]: { timeout: NodeJS.Timeout } };

    getGame(roomId: string) {
        return this.games[roomId];
    }

    setGame(roomId: string, timeout: NodeJS.Timeout) {
        this.games[roomId] = { timeout };
    }
}

const liveGames = new LiveGames();
export default liveGames;

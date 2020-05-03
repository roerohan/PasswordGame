export default function wordGenerator(): string {
    const words: string[] = ['word1', 'word2'];

    function randomInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    return words[randomInteger(0, words.length)];
}

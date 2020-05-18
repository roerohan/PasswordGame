import words from './words';

export default function wordGenerator(): string {
    function randomInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    return words[randomInteger(0, words.length)];
}

export const words: string[] = [
    'word1',
    'word2',
    'word3',
    'word4',
    'word5',
    'word6',
    'word7',
    'word8',
    'word9',
    'word10',
    'word11',
    'word12',
    'word13',
    'word14',
    'word15',
    'word16',
    'word17',
    'word18',
    'word19',
    'word20',
];

export default function wordGenerator(): string {
    function randomInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    return words[randomInteger(0, words.length)];
}

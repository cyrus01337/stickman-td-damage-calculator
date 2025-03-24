export const toTitleCase = (text: string) => {
    const firstLetter = text.slice(0, 1).toUpperCase();
    const rest = text.slice(1).toLowerCase();

    return firstLetter + rest;
};

export const sum = (numbers: number[]) => numbers.reduce((total, n) => total + n, 0);

const removeDecimalsIfEquivalent = (number: number) => {
    const absoluteNumber = Math.abs(number);

    return number === absoluteNumber ? absoluteNumber : number;
};

const round = (number: number, places = 0) => {
    const multiplier = 10 ** places;

    return Math.round(number * multiplier) / multiplier;
};

export const prettifyNumber = (number: number, places: number) =>
    removeDecimalsIfEquivalent(round(number, places)).toLocaleString("en-GB");

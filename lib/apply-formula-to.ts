interface Properties {
    attackMultiplier: number;
    cooldownReduction: number[];
    criticalChance: number;
    criticalDamage: number;
}

type TotalDamageMultiplier = number;
type TotalAdditiveDamageMultiplier = number;

const sum = (numbers: number[]) => numbers.reduce((total, n) => total + n, 0);

const removeDecimalsIfEquivalent = (number: number) => {
    const absoluteNumber = Math.abs(number);

    return number === absoluteNumber ? absoluteNumber : number;
};

const round = (number: number, places = 0) => {
    const multiplier = 10 ** places;

    return Math.round(number * multiplier) / multiplier;
};

const prettifyNumber = (number: number, places: number) => removeDecimalsIfEquivalent(round(number, places));

export default (properties: Properties): [TotalDamageMultiplier, TotalAdditiveDamageMultiplier] => {
    let { cooldownReduction } = properties;
    const totalCooldownReduction = sum(cooldownReduction);

    if (totalCooldownReduction > 1) {
        cooldownReduction = [1, 0];
    }

    const totalDamageMultiplier =
        (1 + properties.attackMultiplier) *
        (properties.criticalChance * (properties.criticalDamage + 1.5) + (1 - properties.criticalChance)) *
        ((1 / (1 - properties.cooldownReduction[0])) * (1 / (1 - properties.cooldownReduction[1])));
    const totalAdditiveDamageMultiplier = totalDamageMultiplier + 1;

    return [prettifyNumber(totalDamageMultiplier * 100, 2), prettifyNumber(totalAdditiveDamageMultiplier * 100, 2)];
};

import { sum } from "lib/utilities";

interface CalculateDPSMultipliersProperties {
    attackMultiplier: number;
    cooldownReduction: number[];
    criticalChance: number;
    criticalDamage: number;
}

interface Properties {
    attackMultipliers: [number, number];
    baseCooldown: number;
    baseDamage: number;
    cooldownReductionMultipliers: [number, number];
    criticalChanceMultipliers: [number, number];
    criticalDamageMultipliers: [number, number];
}

type DamageMultiplier = number;
type DamagePerSecond = number;

const calculateMultiplier = (properties: CalculateDPSMultipliersProperties): DamageMultiplier => {
    let { cooldownReduction } = properties;
    const totalCooldownReduction = sum(cooldownReduction);

    if (totalCooldownReduction > 1) {
        cooldownReduction = [1, 0];
    }

    return (
        (1 + properties.attackMultiplier) *
        (properties.criticalChance * (properties.criticalDamage + 1.5) + (1 - properties.criticalChance)) *
        ((1 / (1 - cooldownReduction[0])) * (1 / (1 - cooldownReduction[1])))
    );
};

const applyFormulaTo = (properties: Properties): [DamagePerSecond, DamageMultiplier] => {
    const attackMultiplier = sum(properties.attackMultipliers);
    const criticalChance = Math.min(sum(properties.criticalChanceMultipliers), 1);
    const criticalDamage = sum(properties.criticalDamageMultipliers);
    const cooldownReduction = properties.cooldownReductionMultipliers;
    const multiplier = calculateMultiplier({
        attackMultiplier,
        cooldownReduction,
        criticalChance,
        criticalDamage,
    });
    const baseDPS = properties.baseDamage / (properties.baseCooldown > 0 ? properties.baseCooldown : 1);

    /* eslint-disable no-console */
    if (import.meta.env.PUBLIC_DEBUG) {
        console.log("Attack multiplier:", attackMultiplier);
        console.log("Critical chance:", criticalChance);
        console.log("Critical damage:", criticalDamage);
        console.log("Cooldown reduction:", cooldownReduction);
        console.log("Multiplier:", multiplier);
    }
    /* eslint-enable no-console */

    return [baseDPS * multiplier, multiplier];
};

export default {
    applyFormulaTo,
    calculateMultiplier,
};

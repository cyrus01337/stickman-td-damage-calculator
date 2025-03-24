import damage from "lib/damage";
import { prettifyNumber, toTitleCase } from "lib/utilities";

const EXTRACT_DATA = /^(?<name>[a-z-]+)-(?<index>[12])$/;
const NO_INDEX = -1;
const BASE_DAMAGE = document.getElementById("base-damage") as HTMLInputElement;
const COOLDOWN = document.getElementById("cooldown") as HTMLInputElement;

type Name = "baseDamage" | "cooldown" | "cooldownReduction" | "criticalChance" | "criticalDamage" | "damage";
type EquipmentMultiplierDefaults = Record<Name, number>;

interface EquipmentMultiplierElements {
    cooldownReduction: HTMLInputElement;
    criticalChance: HTMLInputElement;
    criticalDamage: HTMLInputElement;
    damage: HTMLInputElement;
}

const EQUIPMENT: EquipmentMultiplierElements[] = [
    {
        cooldownReduction: document.getElementById("cooldown-reduction-1") as HTMLInputElement,
        criticalChance: document.getElementById("critical-chance-1") as HTMLInputElement,
        criticalDamage: document.getElementById("critical-multiplier-1") as HTMLInputElement,
        damage: document.getElementById("damage-1") as HTMLInputElement,
    },
    {
        cooldownReduction: document.getElementById("cooldown-reduction-2") as HTMLInputElement,

        criticalChance: document.getElementById("critical-chance-2") as HTMLInputElement,
        criticalDamage: document.getElementById("critical-multiplier-2") as HTMLInputElement,
        damage: document.getElementById("damage-2") as HTMLInputElement,
    },
];
const DEFAULTS: EquipmentMultiplierDefaults = {
    baseDamage: 0,
    cooldown: 1,
    cooldownReduction: 0,
    criticalChance: 0,
    criticalDamage: 0,
    damage: 0,
};
const OUTPUT = document.getElementById("output") as HTMLSpanElement;
const i: [number, number] = [0, 0];
const c: [number, number] = [0, 0];
const d: [number, number] = [0, 0];
const s: [number, number] = [0, 0];
const previousInputs: Record<string, string> = {};

interface ElementDataProfile {
    index: number;
    name: Name;
}

const convertIDToName = (id: string) => {
    const fragments = id.split("-");
    const firstWord = fragments[0];
    const rest = fragments.slice(1).map(toTitleCase);

    return (firstWord + rest) as Name;
};

const extractDataProfileFrom = (id: string): ElementDataProfile | null => {
    const result = id.match(EXTRACT_DATA);

    if (!result || !result.groups) {
        return null;
    }

    return {
        index: parseInt(result.groups.index),
        name: convertIDToName(result.groups.name),
    } satisfies ElementDataProfile;
};

const isEmpty = (text: string) => !text;

const isValidNumber = (contents: string) => {
    const parsed = parseFloat(contents);
    const isNaN = parsed !== parsed;

    return !isNaN;
};

const voidKeypressFor = (inputElement: HTMLInputElement) => {
    const currentContent = inputElement.value;
    const previousInputFound = previousInputs[inputElement.id];

    if (currentContent.length === 1 && previousInputFound.length > 0) {
        inputElement.value = "";
    } else {
        inputElement.value = previousInputFound;
    }
};

const processNewInput = (target: HTMLInputElement, fallback: number): [number, number] => {
    const result = extractDataProfileFrom(target.id);
    let index = NO_INDEX;

    if (result !== null) {
        index = result.index;
    }

    if (isEmpty(target.value)) {
        previousInputs[target.id] = target.value;

        return [fallback, index];
    } else if (result?.name === "cooldownReduction" || result?.name === "cooldown") {
        if (!isValidNumber(target.value)) {
            const previousInputFound = previousInputs[target.id];

            if (target.value !== "-") {
                voidKeypressFor(target);
            }

            return [previousInputFound ? parseFloat(previousInputFound) : fallback, index];
        }
    } else if (!isValidNumber(target.value)) {
        const previousInputFound = previousInputs[target.id];

        voidKeypressFor(target);

        return [previousInputFound ? parseFloat(previousInputFound) : fallback, index];
    }

    let parsedNumber = parseFloat(target.value);

    if (result?.name !== "cooldownReduction" && result?.name !== "cooldown" && parsedNumber < 0) {
        parsedNumber = Math.abs(parsedNumber);

        voidKeypressFor(target);
    }

    previousInputs[target.id] = target.value;

    return [parsedNumber, index];
};

const performAndShowCalculation = (baseDamageElement: HTMLInputElement, cooldownElement: HTMLInputElement) => {
    const [baseDamage] = processNewInput(baseDamageElement, DEFAULTS.baseDamage);
    const [cooldown] = processNewInput(cooldownElement, DEFAULTS.cooldown);
    const [damagePerSecond, damageMultiplier] = damage.applyFormulaTo({
        attackMultipliers: i,
        baseCooldown: cooldown,
        cooldownReductionMultipliers: s,
        criticalChanceMultipliers: c,
        criticalDamageMultipliers: d,
        baseDamage,
    });
    const prettyDamagePerSecond = prettifyNumber(damagePerSecond, 1);
    const prettyDamageMultiplier = prettifyNumber(damageMultiplier * 100, 2);
    const symbol = Math.sign(damageMultiplier - 1) === 1 ? "+" : "";
    const prettyAdditiveDamageMultiplier = prettifyNumber((damageMultiplier - 1) * 100, 2);

    OUTPUT.textContent = `${prettyDamagePerSecond} (${prettyDamageMultiplier}% or ${symbol}${prettyAdditiveDamageMultiplier}%)`;
};

const displayCalculatedDamage: EventListener = () => {
    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackCooldownReductions: EventListener = event => {
    const [cooldownReduction, index] = processNewInput(event.target as HTMLInputElement, DEFAULTS.cooldownReduction);
    s[index - 1] = cooldownReduction / 100;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackCriticalChances: EventListener = event => {
    const [criticalChance, index] = processNewInput(event.target as HTMLInputElement, DEFAULTS.criticalChance);
    c[index] = criticalChance / 100;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackCriticalDamageMultipliers: EventListener = event => {
    const [criticalDamageMultiplier, index] = processNewInput(
        event.target as HTMLInputElement,
        DEFAULTS.criticalDamage,
    );
    d[index] = criticalDamageMultiplier / 100;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackDamageMultipliers: EventListener = event => {
    const [damageMultiplier, index] = processNewInput(event.target as HTMLInputElement, DEFAULTS.damage);
    i[index] = damageMultiplier / 100;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackEquipmentSelection: EventListener = event => {
    const target = event.target as HTMLSelectElement;
    const data = extractDataProfileFrom(target.id) as ElementDataProfile;
    const option = document.getElementById(target.value) as HTMLOptionElement;

    const cooldownReductionInput = EQUIPMENT[data.index - 1].cooldownReduction;
    cooldownReductionInput.value = option.dataset.cooldownReduction ?? "";
    const [cooldownReductionMultiplier, cooldownReductionIndex] = processNewInput(
        cooldownReductionInput,
        DEFAULTS.cooldownReduction,
    );
    s[cooldownReductionIndex - 1] = cooldownReductionMultiplier / 100;

    const criticalChanceInput = EQUIPMENT[data.index - 1].criticalChance;
    criticalChanceInput.value = option.dataset.criticalChance ?? "";
    const [criticalChance, criticalChangeIndex] = processNewInput(criticalChanceInput, DEFAULTS.criticalChance);
    c[criticalChangeIndex - 1] = criticalChance / 100;

    const criticalDamageInput = EQUIPMENT[data.index - 1].criticalDamage;
    criticalDamageInput.value = option.dataset.criticalDamage ?? "";
    const [criticalDamageMultiplier, criticalDamageIndex] = processNewInput(
        criticalDamageInput,
        DEFAULTS.criticalDamage,
    );
    d[criticalDamageIndex - 1] = criticalDamageMultiplier / 100;

    const damageInput = EQUIPMENT[data.index - 1].damage;
    damageInput.value = option.dataset.damage ?? "";
    const [damageMultiplier, damageIndex] = processNewInput(damageInput, DEFAULTS.damage);
    i[damageIndex - 1] = damageMultiplier / 100;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

BASE_DAMAGE.addEventListener("input", displayCalculatedDamage);
COOLDOWN.addEventListener("input", displayCalculatedDamage);

for (const multipliers of EQUIPMENT) {
    multipliers.cooldownReduction.addEventListener("input", trackCooldownReductions);
    multipliers.criticalChance.addEventListener("input", trackCriticalChances);
    multipliers.criticalDamage.addEventListener("input", trackCriticalDamageMultipliers);
    multipliers.damage.addEventListener("input", trackDamageMultipliers);
}

for (let index = 1; index < 3; index++) {
    const selectorID = `equipment-selector-${index}`;
    const selector = document.getElementById(selectorID) as HTMLSelectElement;

    selector?.addEventListener("change", trackEquipmentSelection);
}

performAndShowCalculation(BASE_DAMAGE, COOLDOWN);

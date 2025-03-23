// TODO: Modularise properly
// FIXME: Prevent all input fields from being processed when interacting with
// one input field
const EXTRACT_DATA = /^(?<name>[a-z-]+)-(?<index>[12])$/;
const NO_INDEX = -1;
const BASE_DAMAGE = document.getElementById("base-damage") as HTMLInputElement;
const COOLDOWN = document.getElementById("cooldown") as HTMLInputElement;

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

type Name = "baseDamage" | "cooldown" | "cooldownReduction" | "criticalChance" | "criticalDamage" | "damage";
type EquipmentMultiplierDefaults = Record<Name, number>;

const DEFAULTS: EquipmentMultiplierDefaults = {
    baseDamage: 0,
    cooldown: 1,
    cooldownReduction: 0,
    criticalChance: 0,
    criticalDamage: 0,
    damage: 0,
};

const OUTPUT = document.getElementById("output") as HTMLSpanElement;
const i = [0, 0];
const c = [0, 0];
const d = [0, 0];
const s = [0, 0];
const previousInputs: Record<string, string> = {};

interface ElementDataProfile {
    index: number;
    name: Name;
}

const toTitleCase = (text: string) => {
    const firstLetter = text.slice(0, 1).toUpperCase();
    const rest = text.slice(1).toLowerCase();

    return firstLetter + rest;
};

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

    if (target.id.startsWith("cooldown-reduction")) {
        console.log(target.value, isValidNumber(target.value));
        console.log(
            isEmpty(target.value),
            result?.name === "cooldownReduction" || result?.name === "cooldown",
            target.value !== "-" && !isValidNumber(target.value),
            !isValidNumber(target.value),
        );
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

const sum = (numbers: number[]) => numbers.reduce((total, n) => total + n, 0);

const removeDecimalsIfEquivalent = (number: number) => {
    const absoluteNumber = Math.abs(number);

    return number === absoluteNumber ? absoluteNumber : number;
};

const round = (number: number, places = 0) => {
    const multiplier = 10 ** places;

    return Math.round(number * multiplier) / multiplier;
};

const prettifyNumber = (number: number, places: number) =>
    removeDecimalsIfEquivalent(round(number, places)).toLocaleString("en-GB");

const applyFormulaTo = (baseDamage: number, cooldown: number) => {
    const attackMultiplier = sum(i);
    const criticalChance = Math.min(sum(c), 1);
    const criticalDamage = sum(d);
    const totalCooldownReduction = sum(s);
    let cooldownReduction = s;

    if (totalCooldownReduction > 1) {
        cooldownReduction = [1, 0];
    }

    const damagePerSecond = baseDamage / (cooldown > 0 ? cooldown : 1);
    const totalDamageMultiplier =
        (1 + attackMultiplier) *
        (criticalChance * (criticalDamage + 1.5) + (1 - criticalChance)) *
        ((1 / (1 - cooldownReduction[0])) * (1 / (1 - cooldownReduction[1])));
    const prettyTotalDPS = prettifyNumber(damagePerSecond * totalDamageMultiplier, 1);
    const prettyTotalDPSMultiplier = prettifyNumber(totalDamageMultiplier * 100, 2);
    const additiveTotalDPSMultiplier = prettifyNumber((totalDamageMultiplier - 1) * 100, 2);

    // Maintain for future debugging
    // console.log("Attack multiplier:", attackMultiplier);
    // console.log("Critical chance:", criticalChance);
    // console.log("Critical damage:", criticalDamage);
    // console.log("Cooldown reduction:", cooldownReduction);
    // console.log("Total damage multiplier:", totalDamageMultiplier);

    return `${prettyTotalDPS} (${prettyTotalDPSMultiplier}% or +${additiveTotalDPSMultiplier}%)`;
};

const performAndShowCalculation = (baseDamageElement: HTMLInputElement, cooldownElement: HTMLInputElement) => {
    const [damage] = processNewInput(baseDamageElement, DEFAULTS.baseDamage);
    const [cooldown] = processNewInput(cooldownElement, DEFAULTS.cooldown);

    OUTPUT.textContent = `${applyFormulaTo(damage, cooldown)}`;
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

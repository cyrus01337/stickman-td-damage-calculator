import damage from "lib/damage";
import { prettifyNumber, toTitleCase } from "lib/utilities";

const EXTRACT_DATA = /^(?<name>[a-z-]+)-(?<index>[12])$/;
const NO_INDEX = -1;
const BASE_DAMAGE = document.getElementById("base-damage") as HTMLInputElement;
const COOLDOWN = document.getElementById("cooldown") as HTMLInputElement;

type Name = "baseDamage" | "cooldown" | "cooldownReduction" | "criticalChance" | "criticalDamage" | "damage";
type Index = number;

interface EquipmentMultiplierElements {
    cooldownReduction: HTMLInputElement;
    criticalChance: HTMLInputElement;
    criticalDamage: HTMLInputElement;
    damage: HTMLInputElement;
}

interface DamageDataset extends Record<string, number | undefined> {
    all: number;
    blunt: number;
    chaos: number;
    slash: number;
    stab: number;
    extra: number;
}

const createDamageDataset = (all_ = 0, blunt = 0, chaos = 0, slash = 0, stab = 0, extra = 0): DamageDataset => ({
    all: all_,
    blunt: all_ + blunt,
    chaos: all_ + chaos,
    slash: all_ + slash,
    stab: all_ + stab,
    extra,
});

interface EquipmentMultiplierDefaults {
    baseDamage: number;
    cooldown: number;
    cooldownReduction: number;
    criticalChance: number;
    criticalDamage: number;
    damage: DamageDataset;
}

const EQUIPMENT = [
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
] satisfies EquipmentMultiplierElements[];
const DEFAULTS: EquipmentMultiplierDefaults = {
    baseDamage: 0,
    cooldown: 1,
    cooldownReduction: 0,
    criticalChance: 0,
    criticalDamage: 0,
    damage: createDamageDataset(),
};
const OUTPUT = document.getElementById("output") as HTMLSpanElement;

const damageMultipliers: [DamageDataset, DamageDataset] = [createDamageDataset(), createDamageDataset()];
const criticalChanceMultipliers: [number, number] = [0, 0];
const criticalDamageMultipliers: [number, number] = [0, 0];
const cooldownReductionMultipliers: [number, number] = [0, 0];
const previousInputsCache: Record<string, string> = {};

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
    const previousInputFound = previousInputsCache[inputElement.id];

    inputElement.value = currentContent.length === 1 && previousInputFound.length > 0 ? "" : previousInputFound;
};

function processNewInput(target: HTMLInputElement, fallback: number): [number, Index];
function processNewInput(target: HTMLOptionElement, fallback: DamageDataset): [DamageDataset, Index];
function processNewInput(
    target: HTMLInputElement | HTMLOptionElement,
    fallback: number | DamageDataset,
): [number | DamageDataset, Index] {
    const result = extractDataProfileFrom(target.id);
    let index = NO_INDEX;

    if (result !== null) {
        index = result.index;
    }

    if (target instanceof HTMLOptionElement) {
        const oldDataset = damageMultipliers[index - 1];

        return [
            createDamageDataset(
                target.dataset?.damageAll ? parseInt(target.dataset.damageAll) : 0,
                target.dataset?.damageBlunt ? parseInt(target.dataset.damageBlunt) : 0,
                target.dataset?.damageChaos ? parseInt(target.dataset.damageChaos) : 0,
                target.dataset?.damageSlash ? parseInt(target.dataset.damageSlash) : 0,
                target.dataset?.damageStab ? parseInt(target.dataset.damageStab) : 0,
                oldDataset.extra,
            ),
            index,
        ];
    }

    target = target as HTMLInputElement;

    if (isEmpty(target.value)) {
        previousInputsCache[target.id] = target.value;

        return [fallback, index];
    } else if (result?.name === "cooldownReduction" || result?.name === "cooldown") {
        if (!isValidNumber(target.value)) {
            const previousInputFound = previousInputsCache[target.id];

            if (target.value !== "-") {
                voidKeypressFor(target);
            }

            return [previousInputFound ? parseFloat(previousInputFound) : fallback, index];
        }
    } else if (!isValidNumber(target.value)) {
        const previousInputFound = previousInputsCache[target.id];

        voidKeypressFor(target);

        return [previousInputFound ? parseFloat(previousInputFound) : fallback, index];
    }

    let parsedNumber = parseFloat(target.value);

    if (result?.name && ["cooldown", "cooldownReduction"].includes(result?.name) && parsedNumber < 0) {
        parsedNumber = Math.abs(parsedNumber);

        voidKeypressFor(target);
    }

    previousInputsCache[target.id] = target.value;

    return [parsedNumber, index];
}

const performAndShowCalculation = (baseDamageElement: HTMLInputElement, cooldownElement: HTMLInputElement) => {
    let newOutput = "";
    const initialDamageDataset = damageMultipliers[0];
    const [baseDamage] = processNewInput(baseDamageElement, DEFAULTS.baseDamage);
    const [cooldown] = processNewInput(cooldownElement, DEFAULTS.cooldown);

    for (const damageType of Object.keys(initialDamageDataset)) {
        const inapplicableDamageMultipliersFound = damageMultipliers
            .map(dataset => (dataset[damageType] as number) + dataset.extra)
            .every(multiplier => multiplier === 0);

        if (damageType === "extra" || inapplicableDamageMultipliersFound) {
            continue;
        }

        if (typeof baseDamage !== "number") {
            throw new Error(`expected base damage to be number, got ${typeof baseDamage}`);
        } else if (typeof cooldown !== "number") {
            throw new Error(`expected cooldown to be number, got ${typeof cooldown}`);
        }

        const [damagePerSecond, damageMultiplier] = damage.applyFormulaTo({
            attackMultipliers: damageMultipliers.map(
                dataset => ((dataset[damageType] as number) + dataset.extra) / 100,
            ) as [number, number],
            baseCooldown: cooldown,
            cooldownReductionMultipliers: cooldownReductionMultipliers,
            criticalChanceMultipliers: criticalChanceMultipliers,
            criticalDamageMultipliers: criticalDamageMultipliers,
            baseDamage,
        });

        const prettyDamagePerSecond = prettifyNumber(damagePerSecond, 1);
        const prettyDamageMultiplier = prettifyNumber(damageMultiplier * 100, 2);
        const symbol = Math.sign(damageMultiplier - 1) === 1 ? "+" : "";
        const prettyAdditiveDamageMultiplier = prettifyNumber((damageMultiplier - 1) * 100, 2);
        // TODO: Investigate better way to do this
        newOutput += `<span class="font-bold">${toTitleCase(damageType)}:</span> ${prettyDamagePerSecond} (${prettyDamageMultiplier}% or ${symbol}${prettyAdditiveDamageMultiplier}%)\n`;
    }

    OUTPUT.innerHTML = newOutput.trimEnd();
};

const displayCalculatedDamage: EventListener = () => {
    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackCooldownReductions: EventListener = event => {
    const [cooldownReduction, index] = processNewInput(event.target as HTMLInputElement, DEFAULTS.cooldownReduction);

    cooldownReductionMultipliers[index - 1] = cooldownReduction / 100;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackCriticalChances: EventListener = event => {
    const [criticalChance, index] = processNewInput(event.target as HTMLInputElement, DEFAULTS.criticalChance);

    criticalChanceMultipliers[index - 1] = criticalChance / 100;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackCriticalDamageMultipliers: EventListener = event => {
    const [criticalDamageMultiplier, index] = processNewInput(
        event.target as HTMLInputElement,
        DEFAULTS.criticalDamage,
    );

    criticalDamageMultipliers[index - 1] = criticalDamageMultiplier / 100;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackDamageMultipliers: EventListener = event => {
    const [damageMultiplier, index] = processNewInput(event.target as HTMLInputElement, DEFAULTS.damage.all);
    const chosenDamageDataset = damageMultipliers[index - 1];
    chosenDamageDataset.extra = damageMultiplier;

    performAndShowCalculation(BASE_DAMAGE, COOLDOWN);
};

const trackEquipmentSelection: EventListener = event => {
    const target = event.target as HTMLSelectElement;
    const data = extractDataProfileFrom(target.id) as ElementDataProfile;
    const option = document.getElementById(target.value) as HTMLOptionElement;
    const dataset = option.dataset;

    const cooldownReductionInput = EQUIPMENT[data.index - 1].cooldownReduction;
    cooldownReductionInput.value = dataset.cooldownReduction ?? "";
    const [newCooldownReductionMultiplier, cooldownReductionIndex] = processNewInput(
        cooldownReductionInput,
        DEFAULTS.cooldownReduction,
    );
    cooldownReductionMultipliers[cooldownReductionIndex - 1] = newCooldownReductionMultiplier / 100;

    const criticalChanceInput = EQUIPMENT[data.index - 1].criticalChance;
    criticalChanceInput.value = dataset.criticalChance ?? "";
    const [criticalChance, criticalChangeIndex] = processNewInput(criticalChanceInput, DEFAULTS.criticalChance);
    criticalChanceMultipliers[criticalChangeIndex - 1] = criticalChance / 100;

    const criticalDamageInput = EQUIPMENT[data.index - 1].criticalDamage;
    criticalDamageInput.value = dataset.criticalDamage ?? "";
    const [criticalDamageMultiplier, criticalDamageIndex] = processNewInput(
        criticalDamageInput,
        DEFAULTS.criticalDamage,
    );
    criticalDamageMultipliers[criticalDamageIndex - 1] = criticalDamageMultiplier / 100;

    const [damageDataset, damageIndex] = processNewInput(option, DEFAULTS.damage);
    damageMultipliers[damageIndex - 1] = damageDataset;

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

    selector.addEventListener("change", trackEquipmentSelection);
}

performAndShowCalculation(BASE_DAMAGE, COOLDOWN);

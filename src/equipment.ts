import { getCollection } from "astro:content";

import type { Equipment } from "./content.config";

export interface NamedEquipment extends Equipment {
    name: string;
}

const toTitleCase = (text: string) => {
    const firstLetter = text.slice(0, 1).toUpperCase();
    const rest = text.slice(1).toLowerCase();

    return firstLetter + rest;
};

const withNames = async (): Promise<NamedEquipment[]> =>
    (await getCollection("equipment")).map(equipment => ({
        ...equipment,
        name: equipment.id
            .split("-")
            .map(word => (word === "of" ? word : toTitleCase(word)))
            .join(" "),
    }));

export default {
    withNames,
};

import { getCollection } from "astro:content";

import { toTitleCase } from "lib/utilities";

import type { CollectionEntry } from "astro:content";

type EquipmentCollectionEntry = CollectionEntry<"equipment">;

interface ExtendedEquipmentCollectionEntry extends EquipmentCollectionEntry {
    name: string;
}

const VALUE = await getCollection("equipment");
const NAMED: ExtendedEquipmentCollectionEntry[] = VALUE.map((equipment: EquipmentCollectionEntry) => ({
    ...equipment,

    name: equipment.id
        .split("-")
        .map((word: string) => (word === "of" ? word : toTitleCase(word)))
        .join(" "),
}));

export default {
    NAMED,
};

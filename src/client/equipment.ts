import { getCollection } from "astro:content";

import { toTitleCase } from "lib/utilities";

const VALUE = await getCollection("equipment");
const NAMED = VALUE.map(equipment => ({
    ...equipment,
    name: equipment.id
        .split("-")
        .map(word => (word === "of" ? word : toTitleCase(word)))
        .join(" "),
}));

export default {
    NAMED,
};

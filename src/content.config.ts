import toml from "@ngdangtu/astro-toml";
import { defineCollection } from "astro:content";

import schemas from "lib/schemas";

const equipment = defineCollection({
    loader: toml({
        expanded_base: "./src/content/equipment/",
        pattern: "*.toml",
    }),
    schema: schemas.EQUIPMENT,
});

export const collections = {
    equipment,
};

import toml from "@ngdangtu/astro-toml";
import { defineCollection, z as zod } from "astro:content";

const equipmentSchema = zod
    .object({
        cooldownReduction: zod.number().optional(),
        criticalChance: zod.number().positive().optional(),
        criticalDamage: zod.number().positive().optional(),
        damage: zod.number().optional(),
        range: zod.number().optional(),
    })
    .refine(data => Object.values(data).some(value => value !== undefined), {
        message: "At least one field must be provided",
        path: [],
    });
const equipment = defineCollection({
    loader: toml({
        expanded_base: "./src/content/equipment/",
        pattern: "*.toml",
    }),
    schema: equipmentSchema,
});

export type Equipment = zod.infer<typeof equipmentSchema>;

export const collections = {
    equipment,
};

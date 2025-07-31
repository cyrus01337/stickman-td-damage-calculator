import { z as zod } from "zod";

const EQUIPMENT = zod
    .strictObject({
        cooldownReduction: zod.number(),
        criticalChance: zod.number(),
        criticalDamage: zod.number(),
        damage: zod
            .strictObject({
                all: zod.number(),
                blunt: zod.number(),
                chaos: zod.number(),
                elements: zod.number(),
                fire: zod.number(),
                frost: zod.number(),
                radiant: zod.number(),
                slash: zod.number(),
                stab: zod.number(),
                umbral: zod.number(),
            })
            .partial()
            .optional()
            .refine(data => (data ? Object.values(data).some(value => value !== undefined) : true), {
                message: "At least one field must be provided if supplying damage",
                path: [],
            }),
        range: zod.number(),
    })
    .partial()
    .refine(data => Object.values(data).some(value => value !== undefined), {
        message: "At least one field must be provided",
        path: [],
    });

export type Equipment = zod.infer<typeof EQUIPMENT>;

export default {
    EQUIPMENT,
};

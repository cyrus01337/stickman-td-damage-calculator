import { z as zod } from "zod";

const EQUIPMENT = zod
    .object({
        cooldownReduction: zod.number().optional(),
        criticalChance: zod.number().optional(),
        criticalDamage: zod.number().optional(),
        damage: zod.number().optional(),
        range: zod.number().optional(),
    })
    .refine(data => Object.values(data).some(value => value !== undefined), {
        message: "At least one field must be provided",
        path: [],
    });

export type Equipment = zod.infer<typeof EQUIPMENT>;

export default {
    EQUIPMENT,
};

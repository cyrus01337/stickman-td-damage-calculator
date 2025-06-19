import fs from "fs";

import { describe, it } from "vitest";

import tests from "lib/tests";

const EQUIPMENT = fs.readdirSync("src/content/equipment", { encoding: "utf8", withFileTypes: true });

describe("Validate the shape of all equipment", () => {
    for (const equipment of EQUIPMENT) {
        it(equipment.name, tests.EQUIPMENT(`${equipment.parentPath}/${equipment.name}`));
    }
});

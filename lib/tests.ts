import fs from "fs";

import toml from "toml";
import { expectTypeOf } from "vitest";

import schemas from "lib/schemas";

import type { Equipment } from "lib/schemas";
import type { TestFunction } from "vitest";

const EQUIPMENT = (filepath: string): TestFunction<Equipment> => {
    const content = fs.readFileSync(filepath, { encoding: "utf8" });
    const deserialised = toml.parse(content);

    return async () => expectTypeOf(schemas.EQUIPMENT.parse(deserialised)).toBeObject();
};

export default {
    EQUIPMENT,
};

import { useStore } from "@nanostores/react";

import { $filterBy } from "~/client/store";

interface Properties {
    equipment: [string, string, number][];
}

const EMPTY = "";

export default (properties: Properties) => {
    const filterBy = useStore($filterBy);
    const maybeFiltered = !filterBy
        ? properties.equipment
        : properties.equipment.filter(([firstName, lastName]) => [firstName, lastName].includes(filterBy));

    // TODO: Rename
    const setFilter = (name: string) => () => $filterBy.set(filterBy !== name ? name : EMPTY);

    return (
        <div className="flex flex-col">
            {maybeFiltered.map(([firstName, lastName, damageMultiplier]) => (
                <span key={`${firstName}-${lastName}`}>
                    <a className="link link-secondary font-bold transition-colors" onClick={setFilter(firstName)}>
                        {firstName}
                    </a>{" "}
                    +{" "}
                    <a className="link link-secondary font-bold transition-colors" onClick={setFilter(lastName)}>
                        {lastName}
                    </a>{" "}
                    = {damageMultiplier}%
                </span>
            ))}
        </div>
    );
};

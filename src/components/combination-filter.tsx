import Select from "@manifoldco/react-select-zero";

import { useStore } from "@nanostores/react";

import { $filterBy } from "~/client/store";

interface Properties {
    names: string[];
}

const EMPTY = "";

export default (properties: Properties) => {
    const value = useStore($filterBy);

    const onChange = (selected: string[]) => {
        $filterBy.set(selected[0] === value ? EMPTY : selected[0]);
    };

    return (
        <Select
            name="combination-filter"
            options={properties.names}
            onChange={onChange}
            value={value ? [value] : []}
            placeholder="Filter by equipment..."
        />
    );
};

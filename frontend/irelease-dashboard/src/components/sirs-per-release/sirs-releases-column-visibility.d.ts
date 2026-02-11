export declare const allColumns: readonly [{
    readonly key: "sir_release_id";
    readonly label: "Sir_Rel_Id";
    readonly width: "w-32";
}, {
    readonly key: "sir_id";
    readonly label: "Sir_Id";
    readonly width: "w-42";
}, {
    readonly key: "release_version";
    readonly label: "Release Version";
    readonly width: "w-32";
}, {
    readonly key: "iteration";
    readonly label: "Iteration";
    readonly width: "w-28";
}, {
    readonly key: "changed_date";
    readonly label: "Changed Date";
    readonly width: "w-48";
}, {
    readonly key: "bug_severity";
    readonly label: "Bug Severity";
    readonly width: "w-48";
}, {
    readonly key: "priority";
    readonly label: "Priority";
    readonly width: "w-32";
}, {
    readonly key: "assigned_to";
    readonly label: "Assigned To";
    readonly width: "w-32";
}, {
    readonly key: "bug_status";
    readonly label: "Bug Status";
    readonly width: "w-32";
}, {
    readonly key: "resolution";
    readonly label: "Resolution";
    readonly width: "w-32";
}, {
    readonly key: "component";
    readonly label: "Component";
    readonly width: "w-32";
}, {
    readonly key: "op_sys";
    readonly label: "Op Sys";
    readonly width: "w-32";
}, {
    readonly key: "short_desc";
    readonly label: "Short Description";
    readonly width: "w-48";
}, {
    readonly key: "cf_sirwith";
    readonly label: "Cf Sir With";
    readonly width: "w-32";
}];
export type ColumnKey = typeof allColumns[number]['key'];
export type ColumnConfig = typeof allColumns[number];
export declare const COLUMN_VISIBILITY_KEY = "sir-releases-column-visibility";
export declare const loadColumnVisibility: () => Record<string, boolean>;
export declare const saveColumnVisibility: (visibility: Record<string, boolean>) => void;
export declare const getVisibleColumns: (visibility: Record<string, boolean>) => ColumnConfig[];
export declare const useColumnVisibility: () => {
    columnVisibility: Record<string, boolean>;
    setColumnVisibility: import("react").Dispatch<import("react").SetStateAction<Record<string, boolean>>>;
    toggleColumnVisibility: (columnKey: string) => void;
    resetColumnVisibility: () => void;
    visibleColumns: ({
        readonly key: "sir_release_id";
        readonly label: "Sir_Rel_Id";
        readonly width: "w-32";
    } | {
        readonly key: "sir_id";
        readonly label: "Sir_Id";
        readonly width: "w-42";
    } | {
        readonly key: "release_version";
        readonly label: "Release Version";
        readonly width: "w-32";
    } | {
        readonly key: "iteration";
        readonly label: "Iteration";
        readonly width: "w-28";
    } | {
        readonly key: "changed_date";
        readonly label: "Changed Date";
        readonly width: "w-48";
    } | {
        readonly key: "bug_severity";
        readonly label: "Bug Severity";
        readonly width: "w-48";
    } | {
        readonly key: "priority";
        readonly label: "Priority";
        readonly width: "w-32";
    } | {
        readonly key: "assigned_to";
        readonly label: "Assigned To";
        readonly width: "w-32";
    } | {
        readonly key: "bug_status";
        readonly label: "Bug Status";
        readonly width: "w-32";
    } | {
        readonly key: "resolution";
        readonly label: "Resolution";
        readonly width: "w-32";
    } | {
        readonly key: "component";
        readonly label: "Component";
        readonly width: "w-32";
    } | {
        readonly key: "op_sys";
        readonly label: "Op Sys";
        readonly width: "w-32";
    } | {
        readonly key: "short_desc";
        readonly label: "Short Description";
        readonly width: "w-48";
    } | {
        readonly key: "cf_sirwith";
        readonly label: "Cf Sir With";
        readonly width: "w-32";
    })[];
    allColumns: readonly [{
        readonly key: "sir_release_id";
        readonly label: "Sir_Rel_Id";
        readonly width: "w-32";
    }, {
        readonly key: "sir_id";
        readonly label: "Sir_Id";
        readonly width: "w-42";
    }, {
        readonly key: "release_version";
        readonly label: "Release Version";
        readonly width: "w-32";
    }, {
        readonly key: "iteration";
        readonly label: "Iteration";
        readonly width: "w-28";
    }, {
        readonly key: "changed_date";
        readonly label: "Changed Date";
        readonly width: "w-48";
    }, {
        readonly key: "bug_severity";
        readonly label: "Bug Severity";
        readonly width: "w-48";
    }, {
        readonly key: "priority";
        readonly label: "Priority";
        readonly width: "w-32";
    }, {
        readonly key: "assigned_to";
        readonly label: "Assigned To";
        readonly width: "w-32";
    }, {
        readonly key: "bug_status";
        readonly label: "Bug Status";
        readonly width: "w-32";
    }, {
        readonly key: "resolution";
        readonly label: "Resolution";
        readonly width: "w-32";
    }, {
        readonly key: "component";
        readonly label: "Component";
        readonly width: "w-32";
    }, {
        readonly key: "op_sys";
        readonly label: "Op Sys";
        readonly width: "w-32";
    }, {
        readonly key: "short_desc";
        readonly label: "Short Description";
        readonly width: "w-48";
    }, {
        readonly key: "cf_sirwith";
        readonly label: "Cf Sir With";
        readonly width: "w-32";
    }];
};
interface SirsReleasesColumnVisibilityProps {
    columnVisibility: Record<string, boolean>;
    toggleColumnVisibility: (columnKey: string) => void;
    resetColumnVisibility: () => void;
    areFiltersSelected?: boolean;
}
export declare const SirsReleasesColumnVisibility: ({ columnVisibility, toggleColumnVisibility, resetColumnVisibility, areFiltersSelected }: SirsReleasesColumnVisibilityProps) => import("react/jsx-runtime").JSX.Element;
export default SirsReleasesColumnVisibility;

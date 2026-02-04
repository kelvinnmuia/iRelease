interface MoSystemsSearchProps {
    value: string;
    onChange: (systemName: string) => void;
    validationError?: string;
    placeholder?: string;
}
export declare const moSystemMapping: Record<string, string>;
export declare const MoSystemsSearch: ({ value, onChange, validationError, placeholder }: MoSystemsSearchProps) => import("react/jsx-runtime").JSX.Element;
export {};

interface SystemsSearchProps {
    value: string;
    onChange: (systemName: string) => void;
    validationError?: string;
    placeholder?: string;
    disabled?: boolean;
}
declare let systemMapping: Record<string, string>;
export declare const SystemsSearch: ({ value, onChange, validationError, placeholder, disabled }: SystemsSearchProps) => import("react/jsx-runtime").JSX.Element;
export { systemMapping };

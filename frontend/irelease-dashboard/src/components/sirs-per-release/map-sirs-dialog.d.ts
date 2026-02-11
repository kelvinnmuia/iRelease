interface MapSirsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMapSirs: (releaseVersion: string, iteration: string, sirs: string) => void;
}
export declare const MapSirsDialog: ({ open, onOpenChange, onMapSirs }: MapSirsDialogProps) => import("react/jsx-runtime").JSX.Element;
export {};

import { Release } from "./types/releases";
interface AddReleaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (release: any) => void;
    existingData: Release[];
}
export declare const AddReleaseDialog: ({ open, onOpenChange, onSave, existingData }: AddReleaseDialogProps) => import("react/jsx-runtime").JSX.Element;
export {};

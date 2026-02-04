import { Release } from "./types/mo-releases";
interface AddReleaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (release: Release) => void;
    existingData: Release[];
}
export declare const AddReleaseDialog: ({ open, onOpenChange, onSave, existingData }: AddReleaseDialogProps) => import("react/jsx-runtime").JSX.Element;
export {};

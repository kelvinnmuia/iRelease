import { Release } from "./types/mo-releases";
interface EditReleaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    release: Release | null;
    onSave: (release: Release) => void;
}
export declare const EditReleaseDialog: ({ open, onOpenChange, release, onSave }: EditReleaseDialogProps) => import("react/jsx-runtime").JSX.Element | null;
export {};

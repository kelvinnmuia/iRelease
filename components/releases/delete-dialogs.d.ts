import { Release } from "./types/releases";
interface DeleteDialogsProps {
    bulkDeleteOpen: boolean;
    setBulkDeleteOpen: (open: boolean) => void;
    singleDeleteOpen: boolean;
    setSingleDeleteOpen: (open: boolean) => void;
    releaseToDelete: Release | null;
    selectedRowsCount: number;
    onBulkDelete: () => void;
    onSingleDelete: () => void;
    isDeleting?: boolean;
}
export declare const DeleteDialogs: ({ bulkDeleteOpen, setBulkDeleteOpen, singleDeleteOpen, setSingleDeleteOpen, releaseToDelete, selectedRowsCount, onBulkDelete, onSingleDelete, isDeleting }: DeleteDialogsProps) => import("react/jsx-runtime").JSX.Element;
export {};

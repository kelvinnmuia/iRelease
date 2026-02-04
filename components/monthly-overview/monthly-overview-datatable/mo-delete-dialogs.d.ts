import { Release } from "./types/mo-releases";
interface DeleteDialogsProps {
    bulkDeleteOpen: boolean;
    setBulkDeleteOpen: (open: boolean) => void;
    singleDeleteOpen: boolean;
    setSingleDeleteOpen: (open: boolean) => void;
    releaseToDelete: Release | null;
    selectedRowsCount: number;
    onBulkDelete: () => void;
    onSingleDelete: () => void;
}
export declare const DeleteDialogs: ({ bulkDeleteOpen, setBulkDeleteOpen, singleDeleteOpen, setSingleDeleteOpen, releaseToDelete, selectedRowsCount, onBulkDelete, onSingleDelete }: DeleteDialogsProps) => import("react/jsx-runtime").JSX.Element;
export {};

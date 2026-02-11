interface SirRelease {
    id: number;
    sir_release_id: string;
    sir_id: number;
    release_version: string;
    iteration: number;
    changed_date: string;
    bug_severity: string;
    priority: string;
    assigned_to: string;
    bug_status: string;
    resolution: string;
    component: string;
    op_sys: string;
    short_desc: string;
    cf_sirwith: string;
}
interface EditSirsReleaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sirToEdit: SirRelease | null;
    onSave: (sirData: SirRelease) => void;
}
export declare const EditSirsReleaseDialog: ({ open, onOpenChange, sirToEdit, onSave }: EditSirsReleaseDialogProps) => import("react/jsx-runtime").JSX.Element | null;
export {};

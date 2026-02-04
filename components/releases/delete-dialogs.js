import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
export const DeleteDialogs = ({ bulkDeleteOpen, setBulkDeleteOpen, singleDeleteOpen, setSingleDeleteOpen, releaseToDelete, selectedRowsCount, onBulkDelete, onSingleDelete, isDeleting = false // Default to false if not provided
 }) => {
    // Local loading state for single delete
    const [localIsDeleting, setLocalIsDeleting] = useState(false);
    // Reset loading state when dialog closes
    useEffect(() => {
        if (!singleDeleteOpen) {
            setLocalIsDeleting(false);
        }
    }, [singleDeleteOpen]);
    // Reset loading state when prop changes
    useEffect(() => {
        setLocalIsDeleting(isDeleting);
    }, [isDeleting]);
    // Combined loading state
    const isLoading = isDeleting || localIsDeleting;
    // Handle single delete with loading state
    const handleSingleDelete = async () => {
        setLocalIsDeleting(true);
        try {
            await onSingleDelete();
        }
        catch (error) {
            // Reset loading state on error
            setLocalIsDeleting(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Dialog, { open: bulkDeleteOpen, onOpenChange: setBulkDeleteOpen, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Confirm Bulk Deletion" }), _jsxs(DialogDescription, { children: ["Are you sure you want to delete ", selectedRowsCount, " selected release(s)? This action cannot be undone."] })] }), _jsxs(DialogFooter, { className: "flex gap-2 sm:gap-0", children: [_jsx(Button, { variant: "outline", onClick: () => setBulkDeleteOpen(false), className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2", children: "No, Cancel" }), _jsxs(Button, { onClick: onBulkDelete, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2", children: ["Yes, Delete ", selectedRowsCount, " Release(s)"] })] })] }) }), _jsx(Dialog, { open: singleDeleteOpen, onOpenChange: (open) => {
                    if (!isLoading) {
                        setSingleDeleteOpen(open);
                    }
                }, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Confirm Deletion" }), _jsxs(DialogDescription, { children: ["Are you sure you want to delete release ", releaseToDelete?.releaseVersion, "? This action cannot be undone."] })] }), _jsxs(DialogFooter, { className: "flex gap-2 sm:gap-0", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                        if (!isLoading) {
                                            setSingleDeleteOpen(false);
                                        }
                                    }, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2", disabled: isLoading, children: "No, Cancel" }), _jsx(Button, { onClick: handleSingleDelete, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Deleting..."] })) : ("Yes, Delete") })] })] }) })] }));
};

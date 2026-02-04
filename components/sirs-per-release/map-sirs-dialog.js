import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export const MapSirsDialog = ({ open, onOpenChange, onMapSirs }) => {
    const [releaseVersion, setReleaseVersion] = useState("");
    const [iteration, setIteration] = useState("");
    const [sirs, setSirs] = useState("");
    const [sirsCount, setSirsCount] = useState(0);
    const textareaRef = useRef(null);
    // Calculate SIRs count when sirs changes
    useEffect(() => {
        if (sirs.trim()) {
            const count = sirs.split(/[\n,]+/).filter(s => s.trim()).length;
            setSirsCount(count);
        }
        else {
            setSirsCount(0);
        }
    }, [sirs]);
    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setReleaseVersion("");
            setIteration("");
            setSirs("");
        }
    }, [open]);
    const handleMap = () => {
        if (releaseVersion.trim() && iteration.trim() && sirs.trim()) {
            onMapSirs(releaseVersion, iteration, sirs);
            onOpenChange(false);
        }
    };
    const handleCancel = () => {
        onOpenChange(false);
    };
    // Handle textarea input
    const handleTextareaChange = (e) => {
        setSirs(e.target.value);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-xl font-semibold", children: "Map SIRs" }), _jsx(DialogDescription, { children: "Enter release version, iteration, and SIRs to map" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "releaseVersion", className: "text-sm font-medium", children: "Release Version" }), _jsx(Input, { id: "releaseVersion", value: releaseVersion, onChange: (e) => setReleaseVersion(e.target.value), placeholder: "e.g., 3.9.232.1", className: "focus:ring-2 focus:ring-red-400" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "iteration", className: "text-sm font-medium", children: "Iteration" }), _jsx(Input, { id: "iteration", value: iteration, onChange: (e) => setIteration(e.target.value), placeholder: "e.g., 2", className: "focus:ring-2 focus:ring-red-400" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { htmlFor: "sirs", className: "text-sm font-medium", children: "SIRs List" }), sirsCount > 0 && (_jsxs("span", { className: "text-xs text-gray-500", children: [sirsCount, " SIR", sirsCount !== 1 ? 's' : ''] }))] }), _jsx("div", { className: "relative", children: _jsx(Textarea, { ref: textareaRef, id: "sirs", value: sirs, onChange: handleTextareaChange, placeholder: `Paste multiple SIRs (one per line or comma-separated)

e.g., 117773, 119176, 119431`, rows: 8, className: "w-full resize-none focus:ring-2 focus:ring-red-400 overflow-y-auto", style: {
                                            height: '80px',
                                            minHeight: '80px',
                                            maxHeight: '80px',
                                        } }) }), _jsx("p", { className: "text-xs text-gray-500", children: "You can paste SIRs separated by commas or new lines" })] })] }), _jsxs(DialogFooter, { className: "flex flex-col sm:flex-row gap-3", children: [_jsx(Button, { variant: "outline", onClick: handleMap, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50", children: "Map" }), _jsx(Button, { onClick: handleCancel, className: "flex-1 bg-red-500 text-white hover:bg-red-600", children: "Discard" })] })] }) }));
};

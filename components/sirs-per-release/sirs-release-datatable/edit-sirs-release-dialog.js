import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Options for dropdowns (extracted from your datatable)
const bugSeverityOptions = ["Critical", "Minor", "Major", "Blocker", "Spec", "Normal", "Enhancement", "Setup"];
const bugStatusOptions = ["Open", "Resolved", "Closed", "Reopened", "New", "Assigned", "Verified"];
const resolutionOptions = ["Unresolved", "Wontfix", "Fixed", "Verified", "Closed", "Invalid", "Duplicate", "Worksforme", "Deferred", "Unconfirmed"];
const priorityOptions = ["P1", "P2", "P3", "P4", "P5"];
const componentOptions = ["MV", "MAN", "EXM", "API", "UI", "DB", "ALL"]; // Keep for reference if needed elsewhere
const osOptions = ["All", "Linux", "Windows", "MacOS"];
export const EditSirsReleaseDialog = ({ open, onOpenChange, sirToEdit, onSave }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        if (sirToEdit) {
            setFormData({ ...sirToEdit });
        }
    }, [sirToEdit]);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleTextareaChange = (e) => {
        const { id, value } = e.target;
        handleInputChange(id, value);
    };
    const handleInputElementChange = (e) => {
        const { id, value } = e.target;
        // Handle numeric fields
        if (id === 'sir_id' || id === 'iteration') {
            handleInputChange(id, value === '' ? '' : Number(value));
        }
        else {
            handleInputChange(id, value);
        }
    };
    const handleSave = () => {
        if (sirToEdit && onSave) {
            // Validate required fields
            if (!formData.sir_id || !formData.release_version || !formData.bug_severity ||
                !formData.priority || !formData.bug_status || !formData.short_desc) {
                // Return without calling onSave if validation fails
                // Let the parent handle the toast error
                return false;
            }
            onSave({ ...sirToEdit, ...formData });
            return true;
        }
        return false;
    };
    const handleSaveAndClose = () => {
        const success = handleSave();
        if (success) {
            onOpenChange(false);
        }
    };
    const handleCancel = () => {
        onOpenChange(false);
        setFormData({});
    };
    if (!sirToEdit)
        return null;
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6", children: [_jsxs(DialogHeader, { className: "border-b pb-4", children: [_jsx(DialogTitle, { className: "text-xl font-semibold text-gray-900", children: "Edit SIR" }), _jsxs(DialogDescription, { className: "text-gray-600", children: ["Update SIR ", sirToEdit?.sir_id, " details"] })] }), _jsxs("div", { className: "space-y-6 py-4 w-full", children: [_jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "sir_release_id", className: "text-sm font-medium text-gray-700", children: "SIR Release ID" }), _jsx(Input, { id: "sir_release_id", value: formData.sir_release_id || '', disabled: true, className: "w-full bg-gray-100 text-gray-600", placeholder: "SIR Release ID" })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "sir_id", className: "text-sm font-medium text-gray-700", children: "SIR ID *" }), _jsx(Input, { id: "sir_id", type: "number", value: formData.sir_id || '', onChange: handleInputElementChange, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "Enter SIR ID" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "release_version", className: "text-sm font-medium text-gray-700", children: "Release Version *" }), _jsx(Input, { id: "release_version", value: formData.release_version || '', onChange: handleInputElementChange, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "Enter release version" })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "iteration", className: "text-sm font-medium text-gray-700", children: "Iteration" }), _jsx(Input, { id: "iteration", value: formData.iteration || '', onChange: handleInputElementChange, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "Enter iteration" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "bug_severity", className: "text-sm font-medium text-gray-700", children: "Bug Severity *" }), _jsxs(Select, { value: formData.bug_severity || '', onValueChange: (value) => handleInputChange('bug_severity', value), children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select bug severity" }) }), _jsx(SelectContent, { children: bugSeverityOptions.map((severity) => (_jsx(SelectItem, { value: severity.toLowerCase(), children: severity }, severity))) })] })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "priority", className: "text-sm font-medium text-gray-700", children: "Priority *" }), _jsxs(Select, { value: formData.priority || '', onValueChange: (value) => handleInputChange('priority', value), children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsx(SelectContent, { children: priorityOptions.map((priority) => (_jsx(SelectItem, { value: priority, children: priority }, priority))) })] })] })] })] }), _jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "assigned_to", className: "text-sm font-medium text-gray-700", children: "Assigned To" }), _jsx(Input, { id: "assigned_to", value: formData.assigned_to || '', onChange: handleInputElementChange, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "Enter assigned to email" })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "bug_status", className: "text-sm font-medium text-gray-700", children: "Bug Status *" }), _jsxs(Select, { value: formData.bug_status || '', onValueChange: (value) => handleInputChange('bug_status', value), children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select bug status" }) }), _jsx(SelectContent, { children: bugStatusOptions.map((status) => (_jsx(SelectItem, { value: status.toUpperCase().replace(' ', '_'), children: status }, status))) })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "resolution", className: "text-sm font-medium text-gray-700", children: "Resolution" }), _jsxs(Select, { value: formData.resolution || '', onValueChange: (value) => handleInputChange('resolution', value), children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select resolution" }) }), _jsx(SelectContent, { children: resolutionOptions.map((resolution) => (_jsx(SelectItem, { value: resolution.toUpperCase(), children: resolution }, resolution))) })] })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "component", className: "text-sm font-medium text-gray-700", children: "Component" }), _jsx(Input, { id: "component", value: formData.component || '', onChange: handleInputElementChange, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "Enter component" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "op_sys", className: "text-sm font-medium text-gray-700", children: "Operating System" }), _jsxs(Select, { value: formData.op_sys || '', onValueChange: (value) => handleInputChange('op_sys', value), children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select operating system" }) }), _jsx(SelectContent, { children: osOptions.map((os) => (_jsx(SelectItem, { value: os, children: os }, os))) })] })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "cf_sirwith", className: "text-sm font-medium text-gray-700", children: "Cf Sir With" }), _jsx(Input, { id: "cf_sirwith", value: formData.cf_sirwith || '', onChange: handleInputElementChange, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "Enter cf sir with" })] })] }), _jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "short_desc", className: "text-sm font-medium text-gray-700", children: "Short Description *" }), _jsx(Textarea, { id: "short_desc", value: formData.short_desc || '', onChange: handleTextareaChange, rows: 3, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none", placeholder: "Enter short description" })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Changed Date" }), _jsx(Input, { value: formData.changed_date || '', onChange: (e) => handleInputChange('changed_date', e.target.value), className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "YYYY-MM-DD HH:MM:SS" })] })] })] })] }), _jsxs(DialogFooter, { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t w-full", children: [_jsx(Button, { variant: "outline", onClick: handleSaveAndClose, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 w-full", children: "Save Changes" }), _jsx(Button, { onClick: handleCancel, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 w-full", children: "Discard" })] })] }) }));
};

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// add-release-dialog.tsx
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerInput } from "./date-picker-input";
import { releaseTypeOptions, testStatusOptions, deploymentStatusOptions, monthOptions } from "./constants/releases-constants";
import { SystemsSearch, systemMapping } from "./systems-search";
import { createReleaseFromForm } from "@/db/create-release";
const initialFormData = {
    releaseVersion: "",
    systemName: "",
    systemId: "",
    iteration: "1",
    releaseType: "",
    testStatus: "",
    deploymentStatus: "",
    deliveredDate: "",
    tdNoticeDate: "",
    testDeployDate: "",
    testStartDate: "",
    testEndDate: "",
    prodDeployDate: "",
    month: "",
    financialYear: "",
    releaseDescription: "",
    functionalityDelivered: "",
    outstandingIssues: "",
    comments: ""
};
export const AddReleaseDialog = ({ open, onOpenChange, onSave, existingData }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: "" }));
        }
    };
    const handleTextareaChange = (e) => {
        const { id, value } = e.target;
        handleInputChange(id, value);
    };
    // Handle system name change - auto-populates system ID
    const handleSystemNameChange = (systemName) => {
        setFormData(prev => ({
            ...prev,
            systemName,
            systemId: systemMapping[systemName] || ""
        }));
        if (validationErrors.systemName) {
            setValidationErrors(prev => ({ ...prev, systemName: "" }));
        }
        if (validationErrors.systemId) {
            setValidationErrors(prev => ({ ...prev, systemId: "" }));
        }
    };
    const validateForm = () => {
        const errors = {};
        const requiredFields = [
            'releaseVersion', 'systemName', 'systemId', 'iteration',
            'releaseType', 'financialYear', 'testStatus', 'deploymentStatus',
            'deliveredDate', 'releaseDescription'
        ];
        requiredFields.forEach(field => {
            if (!formData[field]?.trim()) {
                const fieldName = field.replace(/([A-Z])/g, ' $1').trim();
                errors[field] = `${fieldName} is required`;
            }
        });
        // Validate iteration is a number
        if (formData.iteration && isNaN(Number(formData.iteration))) {
            errors.iteration = "Iteration must be a number";
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsSubmitting(true);
        try {
            // Call the createRelease API with form data
            const createdRelease = await createReleaseFromForm(formData);
            // Call the parent's onSave callback with the created release
            onSave(createdRelease);
            // Reset form
            setFormData(initialFormData);
            setValidationErrors({});
            // Close dialog
            onOpenChange(false);
            // SUCCESS TOAST IS NOW HANDLED ONLY IN createReleaseFromForm FUNCTION
            // No need to show success toast here
        }
        catch (error) {
            // Error toast is already handled in createReleaseFromForm function
            console.error("Failed to save release:", error);
            // Don't close dialog on error - let user fix and try again
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleCancel = () => {
        onOpenChange(false);
        setFormData(initialFormData);
        setValidationErrors({});
    };
    return (_jsx(Dialog, { open: open, onOpenChange: !isSubmitting ? onOpenChange : undefined, children: _jsxs(DialogContent, { className: "w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6", children: [_jsxs(DialogHeader, { className: "border-b pb-4", children: [_jsx(DialogTitle, { className: "text-xl font-semibold text-gray-900", children: "Add New Release" }), _jsxs(DialogDescription, { className: "text-gray-600", children: ["Create a new release with the details below. Fields marked with ", _jsx("span", { className: "text-red-500", children: "*" }), " are required."] })] }), _jsxs("div", { className: "space-y-6 py-4 w-full", children: [_jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "releaseVersion", className: "text-sm font-medium text-gray-700", children: ["Release Version ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "releaseVersion", value: formData.releaseVersion, onChange: (e) => handleInputChange('releaseVersion', e.target.value), className: `w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.releaseVersion ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Enter release version (e.g., 1.5.8)", disabled: isSubmitting }), validationErrors.releaseVersion && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.releaseVersion }))] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "systemName", className: "text-sm font-medium text-gray-700", children: ["System Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(SystemsSearch, { value: formData.systemName, onChange: handleSystemNameChange, validationError: validationErrors.systemName, placeholder: "Select system name", disabled: isSubmitting })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "systemId", className: "text-sm font-medium text-gray-700", children: ["System ID ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "systemId", value: formData.systemId, readOnly: true, className: `w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 bg-gray-50 ${validationErrors.systemId ? 'border-red-500' : 'border-gray-300'}`, placeholder: "System ID", disabled: isSubmitting }), validationErrors.systemId && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.systemId }))] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "iteration", className: "text-sm font-medium text-gray-700", children: ["Iteration ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "iteration", value: formData.iteration, onChange: (e) => handleInputChange('iteration', e.target.value), className: `w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.iteration ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Enter iteration number", disabled: isSubmitting }), validationErrors.iteration && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.iteration }))] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "releaseType", className: "text-sm font-medium text-gray-700", children: ["Release Type ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(Select, { value: formData.releaseType, onValueChange: (value) => handleInputChange('releaseType', value), disabled: isSubmitting, children: [_jsx(SelectTrigger, { className: `w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.releaseType ? 'border-red-500' : 'border-gray-300'}`, children: _jsx(SelectValue, { placeholder: "Select release type" }) }), _jsx(SelectContent, { children: releaseTypeOptions.map((type) => (_jsx(SelectItem, { value: type, children: type }, type))) })] }), validationErrors.releaseType && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.releaseType }))] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "financialYear", className: "text-sm font-medium text-gray-700", children: ["Financial Year ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "financialYear", value: formData.financialYear, onChange: (e) => handleInputChange('financialYear', e.target.value), className: `w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.financialYear ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Enter financial year (e.g., FY2024)", disabled: isSubmitting }), validationErrors.financialYear && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.financialYear }))] })] })] }), _jsx("div", { className: "space-y-4 w-full", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "testStatus", className: "text-sm font-medium text-gray-700", children: ["Test Status ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(Select, { value: formData.testStatus, onValueChange: (value) => handleInputChange('testStatus', value), disabled: isSubmitting, children: [_jsx(SelectTrigger, { className: `w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.testStatus ? 'border-red-500' : 'border-gray-300'}`, children: _jsx(SelectValue, { placeholder: "Select test status" }) }), _jsx(SelectContent, { children: testStatusOptions.map((status) => (_jsx(SelectItem, { value: status, children: status }, status))) })] }), validationErrors.testStatus && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.testStatus }))] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "deploymentStatus", className: "text-sm font-medium text-gray-700", children: ["Deployment Status ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(Select, { value: formData.deploymentStatus, onValueChange: (value) => handleInputChange('deploymentStatus', value), disabled: isSubmitting, children: [_jsx(SelectTrigger, { className: `w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.deploymentStatus ? 'border-red-500' : 'border-gray-300'}`, children: _jsx(SelectValue, { placeholder: "Select deployment status" }) }), _jsx(SelectContent, { children: deploymentStatusOptions.map((status) => (_jsx(SelectItem, { value: status, children: status }, status))) })] }), validationErrors.deploymentStatus && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.deploymentStatus }))] })] }) }), _jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { className: "text-sm font-medium text-gray-700", children: ["Date Delivered ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(DatePickerInput, { value: formData.deliveredDate, onChange: (value) => handleInputChange('deliveredDate', value), placeholder: "Select delivery date", disabled: isSubmitting }), validationErrors.deliveredDate && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.deliveredDate }))] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "TD Notice Date" }), _jsx(DatePickerInput, { value: formData.tdNoticeDate, onChange: (value) => handleInputChange('tdNoticeDate', value), placeholder: "Select TD notice date", disabled: isSubmitting })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Test Deploy Date" }), _jsx(DatePickerInput, { value: formData.testDeployDate, onChange: (value) => handleInputChange('testDeployDate', value), placeholder: "Select test deploy date", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Test Start Date" }), _jsx(DatePickerInput, { value: formData.testStartDate, onChange: (value) => handleInputChange('testStartDate', value), placeholder: "Select test start date", disabled: isSubmitting })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Test End Date" }), _jsx(DatePickerInput, { value: formData.testEndDate, onChange: (value) => handleInputChange('testEndDate', value), placeholder: "Select test end date", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Prod Deploy Date" }), _jsx(DatePickerInput, { value: formData.prodDeployDate, onChange: (value) => handleInputChange('prodDeployDate', value), placeholder: "Select production deploy date", disabled: isSubmitting })] })] })] }), _jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "month", className: "text-sm font-medium text-gray-700", children: "Month" }), _jsxs(Select, { value: formData.month, onValueChange: (value) => handleInputChange('month', value), disabled: isSubmitting, children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select month" }) }), _jsx(SelectContent, { children: monthOptions.map((month) => (_jsx(SelectItem, { value: month, children: month }, month))) })] })] }), _jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsxs(Label, { htmlFor: "releaseDescription", className: "text-sm font-medium text-gray-700", children: ["Release Description ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Textarea, { id: "releaseDescription", value: formData.releaseDescription, onChange: handleTextareaChange, rows: 3, className: `w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto ${validationErrors.releaseDescription ? 'border-red-500' : 'border-gray-300'}`, style: { wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }, placeholder: "Enter release description", disabled: isSubmitting }), validationErrors.releaseDescription && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.releaseDescription }))] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "functionalityDelivered", className: "text-sm font-medium text-gray-700", children: "Functionality Delivered" }), _jsx(Textarea, { id: "functionalityDelivered", value: formData.functionalityDelivered, onChange: handleTextareaChange, rows: 3, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto", style: { wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }, placeholder: "Enter functionality delivered", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "outstandingIssues", className: "text-sm font-medium text-gray-700", children: "Outstanding Issues" }), _jsx(Textarea, { id: "outstandingIssues", value: formData.outstandingIssues, onChange: handleTextareaChange, rows: 4, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto", style: { wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }, placeholder: "Describe outstanding issues, bugs, or pending tasks...", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "comments", className: "text-sm font-medium text-gray-700", children: "Comments" }), _jsx(Textarea, { id: "comments", value: formData.comments, onChange: handleTextareaChange, rows: 3, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto", style: { wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }, placeholder: "Enter comments", disabled: isSubmitting })] })] })] })] }), _jsxs(DialogFooter, { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t w-full", children: [_jsx(Button, { variant: "outline", onClick: handleSave, disabled: isSubmitting, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2 disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" }), "Creating..."] })) : ("Create Release") }), _jsx(Button, { onClick: handleCancel, disabled: isSubmitting, variant: "destructive", className: "flex-1 bg-red-500 text-white hover:bg-red-600 lg:ml-2 disabled:opacity-50 disabled:cursor-not-allowed", children: "Discard" })] })] }) }));
};

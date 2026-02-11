import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerInput } from "./date-picker-input";
import { releaseTypeOptions, testStatusOptions, deploymentStatusOptions, monthOptions, financialYearOptions } from "./constants/releases-constants";
import { Search, ChevronDown } from "lucide-react";
import { updateReleaseFromForm } from "@/db/update-release";
export const EditReleaseDialog = ({ open, onOpenChange, release, onSave }) => {
    const [formData, setFormData] = useState({});
    const [isFinancialYearOpen, setIsFinancialYearOpen] = useState(false);
    const [financialYearSearch, setFinancialYearSearch] = useState("");
    const [filteredFinancialYears, setFilteredFinancialYears] = useState(financialYearOptions);
    const [isSubmitting, setIsSubmitting] = useState(false); // ADD SAVING STATE
    const financialYearDropdownRef = useRef(null);
    const financialYearSearchRef = useRef(null);
    useEffect(() => {
        if (release) {
            setFormData({ ...release });
        }
    }, [release]);
    // Filter financial years based on search
    useEffect(() => {
        if (financialYearSearch.trim() === "") {
            setFilteredFinancialYears(financialYearOptions);
        }
        else {
            const filtered = financialYearOptions.filter(year => year.toLowerCase().includes(financialYearSearch.toLowerCase()));
            setFilteredFinancialYears(filtered);
        }
    }, [financialYearSearch]);
    // Close financial year dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (financialYearDropdownRef.current && !financialYearDropdownRef.current.contains(event.target)) {
                setIsFinancialYearOpen(false);
                setFinancialYearSearch("");
            }
        };
        if (isFinancialYearOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Focus search input when dropdown opens
            setTimeout(() => {
                financialYearSearchRef.current?.focus();
            }, 100);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isFinancialYearOpen]);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleTextareaChange = (e) => {
        const { id, value } = e.target;
        handleInputChange(id, value);
    };
    const handleFinancialYearSelect = (year) => {
        handleInputChange('financialYear', year);
        setIsFinancialYearOpen(false);
        setFinancialYearSearch("");
    };
    const clearFinancialYearSearch = () => {
        setFinancialYearSearch("");
        financialYearSearchRef.current?.focus();
    };
    // Update the handleSave function with saving state
    const handleSave = async () => {
        if (!release)
            return;
        setIsSubmitting(true); // START SAVING STATE
        try {
            // Use a different variable name to avoid conflict with state variable
            const updateData = {
                systemName: formData.systemName || release.systemName,
                systemId: formData.systemId || release.systemId,
                releaseVersion: formData.releaseVersion || release.releaseVersion,
                iteration: formData.iteration || release.iteration,
                releaseType: formData.releaseType || release.releaseType,
                financialYear: formData.financialYear || release.financialYear,
                testStatus: formData.testStatus || release.testStatus,
                deploymentStatus: formData.deploymentStatus || release.deploymentStatus,
                deliveredDate: formData.deliveredDate || release.deliveredDate,
                tdNoticeDate: formData.tdNoticeDate || release.tdNoticeDate,
                testDeployDate: formData.testDeployDate || release.testDeployDate,
                testStartDate: formData.testStartDate || release.testStartDate,
                testEndDate: formData.testEndDate || release.testEndDate,
                prodDeployDate: formData.prodDeployDate || release.prodDeployDate,
                month: formData.month || release.month,
                releaseDescription: formData.releaseDescription || release.releaseDescription,
                functionalityDelivered: formData.functionalityDelivered || release.functionalityDelivered,
                outstandingIssues: formData.outstandingIssues || release.outstandingIssues,
                comments: formData.comments || release.comments
            };
            // Call the update API
            const updatedRelease = await updateReleaseFromForm(release.releaseId, updateData);
            // Call the parent's onSave callback with the updated release
            onSave(updatedRelease);
            // Close dialog
            onOpenChange(false);
        }
        catch (error) {
            console.error("Failed to update release:", error);
            // Error toast is already shown in updateReleaseFromForm function
        }
        finally {
            setIsSubmitting(false); // END SAVING STATE
        }
    };
    const handleCancel = () => {
        onOpenChange(false);
        setFormData({});
        setFinancialYearSearch("");
        setIsFinancialYearOpen(false);
    };
    if (!release)
        return null;
    return (_jsx(Dialog, { open: open, onOpenChange: !isSubmitting ? onOpenChange : undefined, children: _jsxs(DialogContent, { className: "w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6", children: [_jsxs(DialogHeader, { className: "border-b pb-4", children: [_jsx(DialogTitle, { className: "text-xl font-semibold text-gray-900", children: "Edit Release" }), _jsxs(DialogDescription, { className: "text-gray-600", children: ["Update release ", release.releaseVersion, " details"] })] }), _jsxs("div", { className: "space-y-6 py-4 w-full", children: [_jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "releaseId", className: "text-sm font-medium text-gray-700", children: "Release ID" }), _jsx(Input, { id: "releaseId", value: formData.releaseId || '', disabled: true, className: "w-full bg-gray-100 text-gray-600", placeholder: "Release ID" })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "releaseVersion", className: "text-sm font-medium text-gray-700", children: "Release Version" }), _jsx(Input, { id: "releaseVersion", value: formData.releaseVersion || '', onChange: (e) => handleInputChange('releaseVersion', e.target.value), className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "Enter release version", disabled: isSubmitting })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "systemName", className: "text-sm font-medium text-gray-700", children: "System Name" }), _jsx(Input, { id: "systemName", value: formData.systemName || '', disabled: true, className: "w-full bg-gray-100 text-gray-600", placeholder: "System Name" })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "systemId", className: "text-sm font-medium text-gray-700", children: "System ID" }), _jsx(Input, { id: "systemId", value: formData.systemId || '', disabled: true, className: "w-full bg-gray-100 text-gray-600", placeholder: "System ID" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "iteration", className: "text-sm font-medium text-gray-700", children: "Iteration" }), _jsx(Input, { id: "iteration", value: formData.iteration || '', onChange: (e) => handleInputChange('iteration', e.target.value), className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", placeholder: "Enter iteration", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "releaseType", className: "text-sm font-medium text-gray-700", children: "Release Type" }), _jsxs(Select, { value: formData.releaseType || '', onValueChange: (value) => handleInputChange('releaseType', value), disabled: isSubmitting, children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select release type" }) }), _jsx(SelectContent, { children: releaseTypeOptions.map((type) => (_jsx(SelectItem, { value: type, children: type }, type))) })] })] })] })] }), _jsx("div", { className: "space-y-4 w-full", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "testStatus", className: "text-sm font-medium text-gray-700", children: "Test Status" }), _jsxs(Select, { value: formData.testStatus || '', onValueChange: (value) => handleInputChange('testStatus', value), disabled: isSubmitting, children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select test status" }) }), _jsx(SelectContent, { children: testStatusOptions.map((status) => (_jsx(SelectItem, { value: status, children: status }, status))) })] })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "deploymentStatus", className: "text-sm font-medium text-gray-700", children: "Deployment Status" }), _jsxs(Select, { value: formData.deploymentStatus || '', onValueChange: (value) => handleInputChange('deploymentStatus', value), disabled: isSubmitting, children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select deployment status" }) }), _jsx(SelectContent, { children: deploymentStatusOptions.map((status) => (_jsx(SelectItem, { value: status, children: status }, status))) })] })] })] }) }), _jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Date Delivered" }), _jsx(DatePickerInput, { value: formData.deliveredDate || '', onChange: (value) => handleInputChange('deliveredDate', value), placeholder: "Select delivery date", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "TD Notice Date" }), _jsx(DatePickerInput, { value: formData.tdNoticeDate || '', onChange: (value) => handleInputChange('tdNoticeDate', value), placeholder: "Select TD notice date", disabled: isSubmitting })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Test Deploy Date" }), _jsx(DatePickerInput, { value: formData.testDeployDate || '', onChange: (value) => handleInputChange('testDeployDate', value), placeholder: "Select test deploy date", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Test Start Date" }), _jsx(DatePickerInput, { value: formData.testStartDate || '', onChange: (value) => handleInputChange('testStartDate', value), placeholder: "Select test start date", disabled: isSubmitting })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Test End Date" }), _jsx(DatePickerInput, { value: formData.testEndDate || '', onChange: (value) => handleInputChange('testEndDate', value), placeholder: "Select test end date", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Prod Deploy Date" }), _jsx(DatePickerInput, { value: formData.prodDeployDate || '', onChange: (value) => handleInputChange('prodDeployDate', value), placeholder: "Select production deploy date", disabled: isSubmitting })] })] })] }), _jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "month", className: "text-sm font-medium text-gray-700", children: "Month" }), _jsxs(Select, { value: formData.month || '', onValueChange: (value) => handleInputChange('month', value), disabled: isSubmitting, children: [_jsx(SelectTrigger, { className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400", children: _jsx(SelectValue, { placeholder: "Select month" }) }), _jsx(SelectContent, { children: monthOptions.map((month) => (_jsx(SelectItem, { value: month, children: month }, month))) })] })] }), _jsxs("div", { className: "space-y-2 w-full", ref: financialYearDropdownRef, children: [_jsx(Label, { htmlFor: "financialYear", className: "text-sm font-medium text-gray-700", children: "Financial Year" }), _jsxs("div", { className: "relative", children: [_jsxs("button", { type: "button", onClick: () => !isSubmitting && setIsFinancialYearOpen(!isFinancialYearOpen), disabled: isSubmitting, className: "w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("span", { className: `text-sm ${formData.financialYear ? 'text-gray-900' : 'text-gray-500'}`, children: formData.financialYear || "Select financial year" }), _jsx(ChevronDown, { className: `h-4 w-4 transition-transform ${isFinancialYearOpen ? 'rotate-180' : ''}` })] }), isFinancialYearOpen && (_jsxs("div", { className: "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden", children: [_jsx("div", { className: "p-2 border-b border-gray-200", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { ref: financialYearSearchRef, type: "text", placeholder: "Search financial years...", value: financialYearSearch, onChange: (e) => setFinancialYearSearch(e.target.value), className: "pl-10 pr-10 w-full text-sm", disabled: isSubmitting }), financialYearSearch && !isSubmitting && (_jsx("button", { type: "button", onClick: clearFinancialYearSearch, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg", children: "\u00D7" }))] }) }), _jsx("div", { className: "max-h-48 overflow-y-auto", children: filteredFinancialYears.length > 0 ? (filteredFinancialYears.map((year) => (_jsx("button", { type: "button", onClick: () => !isSubmitting && handleFinancialYearSelect(year), disabled: isSubmitting, className: `w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${formData.financialYear === year ? 'bg-red-50 text-red-600' : 'text-gray-900'}`, children: year }, year)))) : (_jsxs("div", { className: "px-3 py-4 text-center text-gray-500 text-sm", children: ["No FY found matching \"", financialYearSearch, "\""] })) })] }))] })] })] }), _jsxs("div", { className: "space-y-4 w-full", children: [_jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "releaseDescription", className: "text-sm font-medium text-gray-700", children: "Release Description" }), _jsx(Textarea, { id: "releaseDescription", value: formData.releaseDescription || '', onChange: handleTextareaChange, rows: 3, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto", style: { wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }, placeholder: "Enter release description", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "functionalityDelivered", className: "text-sm font-medium text-gray-700", children: "Functionality Delivered" }), _jsx(Textarea, { id: "functionalityDelivered", value: formData.functionalityDelivered || '', onChange: handleTextareaChange, rows: 3, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto", style: { wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }, placeholder: "Enter functionality delivered", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "outstandingIssues", className: "text-sm font-medium text-gray-700", children: "Outstanding Issues" }), _jsx(Textarea, { id: "outstandingIssues", value: formData.outstandingIssues || '', onChange: handleTextareaChange, rows: 4, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto", style: { wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }, placeholder: "Describe outstanding issues, bugs, or pending tasks...", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Label, { htmlFor: "comments", className: "text-sm font-medium text-gray-700", children: "Comments" }), _jsx(Textarea, { id: "comments", value: formData.comments || '', onChange: handleTextareaChange, rows: 3, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto", style: { wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }, placeholder: "Enter comments", disabled: isSubmitting })] })] })] })] }), _jsxs(DialogFooter, { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t w-full", children: [_jsx(Button, { variant: "outline", onClick: handleSave, disabled: isSubmitting, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 w-full disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" }), "Saving..."] })) : ("Save Changes") }), _jsx(Button, { onClick: handleCancel, disabled: isSubmitting, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 w-full disabled:opacity-50 disabled:cursor-not-allowed", children: "Discard" })] })] }) }));
};

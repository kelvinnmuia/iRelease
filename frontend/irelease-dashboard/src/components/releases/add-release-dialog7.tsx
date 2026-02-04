// add-release-dialog.tsx
import { toast } from "sonner";
import { useState, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerInput } from "./date-picker-input";
import { Release } from "./types/releases";
import { 
  releaseTypeOptions, 
  testStatusOptions, 
  deploymentStatusOptions, 
  monthOptions, 
  financialYearOptions 
} from "./constants/releases-constants";
import { SystemsSearch } from "./systems-search";
import { createReleaseFromForm } from "@/db/create-release";

interface AddReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (release: any) => void; // Changed from Release to any to match backend format
  existingData: Release[];
}

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

export const AddReleaseDialog = ({
  open,
  onOpenChange,
  onSave,
  existingData
}: AddReleaseDialogProps) => {
  const [formData, setFormData] = useState(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    handleInputChange(id, value);
  };

  // Handle system name change - auto-populates system ID
  const handleSystemNameChange = (systemName: string) => {
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
    const errors: Record<string, string> = {};
    const requiredFields: (keyof typeof formData)[] = [
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
      
    } catch (error) {
      // Error toast is already handled in createReleaseFromForm function
      console.error("Failed to save release:", error);
      // Don't close dialog on error - let user fix and try again
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData(initialFormData);
    setValidationErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={!isSubmitting ? onOpenChange : undefined}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add New Release
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new release with the details below. Fields marked with <span className="text-red-500">*</span> are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 w-full">
          {/* Release Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="releaseVersion" className="text-sm font-medium text-gray-700">
                  Release Version <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="releaseVersion"
                  value={formData.releaseVersion}
                  onChange={(e) => handleInputChange('releaseVersion', e.target.value)}
                  className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                    validationErrors.releaseVersion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter release version (e.g., 1.5.8)"
                  disabled={isSubmitting}
                />
                {validationErrors.releaseVersion && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.releaseVersion}</p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="systemName" className="text-sm font-medium text-gray-700">
                  System Name <span className="text-red-500">*</span>
                </Label>
                <SystemsSearch
                  value={formData.systemName}
                  onChange={handleSystemNameChange}
                  validationError={validationErrors.systemName}
                  placeholder="Select system name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="systemId" className="text-sm font-medium text-gray-700">
                  System ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="systemId"
                  value={formData.systemId}
                  readOnly
                  className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 bg-gray-50 ${
                    validationErrors.systemId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="System ID"
                  disabled={isSubmitting}
                />
                {validationErrors.systemId && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.systemId}</p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                  Iteration <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="iteration"
                  value={formData.iteration}
                  onChange={(e) => handleInputChange('iteration', e.target.value)}
                  className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                    validationErrors.iteration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter iteration number"
                  disabled={isSubmitting}
                />
                {validationErrors.iteration && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.iteration}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="releaseType" className="text-sm font-medium text-gray-700">
                  Release Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.releaseType}
                  onValueChange={(value) => handleInputChange('releaseType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                    validationErrors.releaseType ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <SelectValue placeholder="Select release type" />
                  </SelectTrigger>
                  <SelectContent>
                    {releaseTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.releaseType && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.releaseType}</p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="financialYear" className="text-sm font-medium text-gray-700">
                  Financial Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="financialYear"
                  value={formData.financialYear}
                  onChange={(e) => handleInputChange('financialYear', e.target.value)}
                  className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                    validationErrors.financialYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter financial year (e.g., FY2024)"
                  disabled={isSubmitting}
                />
                {validationErrors.financialYear && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.financialYear}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="testStatus" className="text-sm font-medium text-gray-700">
                  Test Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.testStatus}
                  onValueChange={(value) => handleInputChange('testStatus', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                    validationErrors.testStatus ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <SelectValue placeholder="Select test status" />
                  </SelectTrigger>
                  <SelectContent>
                    {testStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.testStatus && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.testStatus}</p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="deploymentStatus" className="text-sm font-medium text-gray-700">
                  Deployment Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.deploymentStatus}
                  onValueChange={(value) => handleInputChange('deploymentStatus', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                    validationErrors.deploymentStatus ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <SelectValue placeholder="Select deployment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {deploymentStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.deploymentStatus && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.deploymentStatus}</p>
                )}
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Date Delivered <span className="text-red-500">*</span>
                </Label>
                <DatePickerInput
                  value={formData.deliveredDate}
                  onChange={(value) => handleInputChange('deliveredDate', value)}
                  placeholder="Select delivery date"
                  disabled={isSubmitting}
                />
                {validationErrors.deliveredDate && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.deliveredDate}</p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  TD Notice Date
                </Label>
                <DatePickerInput
                  value={formData.tdNoticeDate}
                  onChange={(value) => handleInputChange('tdNoticeDate', value)}
                  placeholder="Select TD notice date"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Test Deploy Date
                </Label>
                <DatePickerInput
                  value={formData.testDeployDate}
                  onChange={(value) => handleInputChange('testDeployDate', value)}
                  placeholder="Select test deploy date"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Test Start Date
                </Label>
                <DatePickerInput
                  value={formData.testStartDate}
                  onChange={(value) => handleInputChange('testStartDate', value)}
                  placeholder="Select test start date"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Test End Date
                </Label>
                <DatePickerInput
                  value={formData.testEndDate}
                  onChange={(value) => handleInputChange('testEndDate', value)}
                  placeholder="Select test end date"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Prod Deploy Date
                </Label>
                <DatePickerInput
                  value={formData.prodDeployDate}
                  onChange={(value) => handleInputChange('prodDeployDate', value)}
                  placeholder="Select production deploy date"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 w-full">
            <div className="space-y-2 w-full">
              <Label htmlFor="month" className="text-sm font-medium text-gray-700">
                Month
              </Label>
              <Select
                value={formData.month}
                onValueChange={(value) => handleInputChange('month', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Full Width Text Areas */}
            <div className="space-y-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="releaseDescription" className="text-sm font-medium text-gray-700">
                  Release Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="releaseDescription"
                  value={formData.releaseDescription}
                  onChange={handleTextareaChange}
                  rows={3}
                  className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto ${
                    validationErrors.releaseDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
                  placeholder="Enter release description"
                  disabled={isSubmitting}
                />
                {validationErrors.releaseDescription && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.releaseDescription}</p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="functionalityDelivered" className="text-sm font-medium text-gray-700">
                  Functionality Delivered
                </Label>
                <Textarea
                  id="functionalityDelivered"
                  value={formData.functionalityDelivered}
                  onChange={handleTextareaChange}
                  rows={3}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto"
                  style={{ wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
                  placeholder="Enter functionality delivered"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="outstandingIssues" className="text-sm font-medium text-gray-700">
                  Outstanding Issues
                </Label>
                <Textarea
                  id="outstandingIssues"
                  value={formData.outstandingIssues}
                  onChange={handleTextareaChange}
                  rows={4}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto"
                  style={{ wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
                  placeholder="Describe outstanding issues, bugs, or pending tasks..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={handleTextareaChange}
                  rows={3}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-y break-all overflow-x-auto"
                  style={{ wordBreak: "break-all", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
                  placeholder="Enter comments"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></span>
                Creating...
              </>
            ) : (
              "Create Release"
            )}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isSubmitting}
            variant="destructive"
            className="flex-1 bg-red-500 text-white hover:bg-red-600 lg:ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
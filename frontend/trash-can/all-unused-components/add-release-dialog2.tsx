import { toast } from "sonner";
import { useState, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerInput } from "../releases/date-picker-input";
import { Release } from "../releases/types/releases";
import { generateReleaseId } from "../releases/utils/releaseid-utils";
import { 
  releaseTypeOptions, 
  testStatusOptions, 
  deploymentStatusOptions, 
  monthOptions, 
  financialYearOptions 
} from "../releases/constants/releases-constants";

interface AddReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (release: Release) => void;
  existingData: Release[];
}

const initialFormData = {
  releaseVersion: "",
  systemName: "",
  systemId: "",
  iteration: "",
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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newRelease: Release = {
      id: Math.max(...existingData.map(item => item.id), 0) + 1,
      releaseId: generateReleaseId(existingData),
      ...formData
    } as Release;

    onSave(newRelease);
    setFormData(initialFormData);
    setValidationErrors({});
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData(initialFormData);
    setValidationErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  placeholder="Enter release version"
                />
                {validationErrors.releaseVersion && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.releaseVersion}</p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="systemName" className="text-sm font-medium text-gray-700">
                  System Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="systemName"
                  value={formData.systemName}
                  onChange={(e) => handleInputChange('systemName', e.target.value)}
                  className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                    validationErrors.systemName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter system name"
                />
                {validationErrors.systemName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.systemName}</p>
                )}
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
                  onChange={(e) => handleInputChange('systemId', e.target.value)}
                  className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                    validationErrors.systemId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter system ID"
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
                  placeholder="Enter iteration"
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
                  className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none break-words break-all ${
                    validationErrors.releaseDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter release description"
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
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                  placeholder="Enter functionality delivered"
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
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                  placeholder="Describe outstanding issues, bugs, or pending tasks..."
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
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                  placeholder="Enter comments"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
          >
            Create Release
          </Button>
          <Button
            onClick={handleCancel}
            className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
          >
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

"iCMS": "SYS-TDF6N",
  "TLIP": "SYS-7H9K2",
  "eCustoms": "SYS-3M4P8",
  "WIMS": "SYS-1R5T9",
  "iBID": "SYS-6V2W3",
  "iSCAN": "SYS-8X5Y7",
  "iTax": "SYS-TDF67",
  "LMS": "SYS-7H9K6",
  "RTS": "SYS-3M4P7",
  "RECTS": "SYS-1R5T2",
  "CMSB": "SYS-6V2W4",
  "DFG": "SYS-8X5Y3"
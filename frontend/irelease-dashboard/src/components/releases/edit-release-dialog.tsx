import { useState, ChangeEvent, useEffect } from "react";
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

interface EditReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release: Release | null;
  onSave: (release: Release) => void;
}

export const EditReleaseDialog = ({
  open,
  onOpenChange,
  release,
  onSave
}: EditReleaseDialogProps) => {
  const [formData, setFormData] = useState<Partial<Release>>({});

  useEffect(() => {
    if (release) {
      setFormData({ ...release });
    }
  }, [release]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    handleInputChange(id, value);
  };

  const handleSave = () => {
    if (release) {
      onSave({ ...release, ...formData } as Release);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({});
  };

  if (!release) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit Release
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update release {release.releaseVersion} details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 w-full">
          {/* Release Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="releaseId" className="text-sm font-medium text-gray-700">
                  Release ID
                </Label>
                <Input
                  id="releaseId"
                  value={formData.releaseId || ''}
                  disabled
                  className="w-full bg-gray-100 text-gray-600"
                  placeholder="Release ID"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="releaseVersion" className="text-sm font-medium text-gray-700">
                  Release Version
                </Label>
                <Input
                  id="releaseVersion"
                  value={formData.releaseVersion || ''}
                  onChange={(e) => handleInputChange('releaseVersion', e.target.value)}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter release version"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="systemName" className="text-sm font-medium text-gray-700">
                  System Name
                </Label>
                <Input
                  id="systemName"
                  value={formData.systemName || ''}
                  onChange={(e) => handleInputChange('systemName', e.target.value)}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter system name"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="systemId" className="text-sm font-medium text-gray-700">
                  System ID
                </Label>
                <Input
                  id="systemId"
                  value={formData.systemId || ''}
                  onChange={(e) => handleInputChange('systemId', e.target.value)}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter system ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                  Iteration
                </Label>
                <Input
                  id="iteration"
                  value={formData.iteration || ''}
                  onChange={(e) => handleInputChange('iteration', e.target.value)}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter iteration"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="releaseType" className="text-sm font-medium text-gray-700">
                  Release Type
                </Label>
                <Select
                  value={formData.releaseType || ''}
                  onValueChange={(value) => handleInputChange('releaseType', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
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
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="testStatus" className="text-sm font-medium text-gray-700">
                  Test Status
                </Label>
                <Select
                  value={formData.testStatus || ''}
                  onValueChange={(value) => handleInputChange('testStatus', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
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
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="deploymentStatus" className="text-sm font-medium text-gray-700">
                  Deployment Status
                </Label>
                <Select
                  value={formData.deploymentStatus || ''}
                  onValueChange={(value) => handleInputChange('deploymentStatus', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
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
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Date Delivered
                </Label>
                <DatePickerInput
                  value={formData.deliveredDate || ''}
                  onChange={(value) => handleInputChange('deliveredDate', value)}
                  placeholder="Select delivery date"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  TD Notice Date
                </Label>
                <DatePickerInput
                  value={formData.tdNoticeDate || ''}
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
                  value={formData.testDeployDate || ''}
                  onChange={(value) => handleInputChange('testDeployDate', value)}
                  placeholder="Select test deploy date"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Test Start Date
                </Label>
                <DatePickerInput
                  value={formData.testStartDate || ''}
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
                  value={formData.testEndDate || ''}
                  onChange={(value) => handleInputChange('testEndDate', value)}
                  placeholder="Select test end date"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Prod Deploy Date
                </Label>
                <DatePickerInput
                  value={formData.prodDeployDate || ''}
                  onChange={(value) => handleInputChange('prodDeployDate', value)}
                  placeholder="Select production deploy date"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="month" className="text-sm font-medium text-gray-700">
                  Month
                </Label>
                <Select
                  value={formData.month || ''}
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

              <div className="space-y-2 w-full">
                <Label htmlFor="financialYear" className="text-sm font-medium text-gray-700">
                  Financial Year
                </Label>
                <Select
                  value={formData.financialYear || ''}
                  onValueChange={(value) => handleInputChange('financialYear', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                    <SelectValue placeholder="Select financial year" />
                  </SelectTrigger>
                  <SelectContent>
                    {financialYearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Full Width Text Areas */}
            <div className="space-y-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="releaseDescription" className="text-sm font-medium text-gray-700">
                  Release Description
                </Label>
                <Textarea
                  id="releaseDescription"
                  value={formData.releaseDescription || ''}
                  onChange={handleTextareaChange}
                  rows={3}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none break-words break-all"
                  placeholder="Enter release description"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="functionalityDelivered" className="text-sm font-medium text-gray-700">
                  Functionality Delivered
                </Label>
                <Textarea
                  id="functionalityDelivered"
                  value={formData.functionalityDelivered || ''}
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
                  value={formData.outstandingIssues || ''}
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
                  value={formData.comments || ''}
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
            className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 w-full"
          >
            Save Changes
          </Button>
          <Button
            onClick={handleCancel}
            className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 w-full"
          >
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import { useState, ChangeEvent, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define the SIR type based on your datatable interface
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

// Options for dropdowns (extracted from your datatable)
const bugSeverityOptions = ["Critical", "Minor", "Major", "Blocker", "Spec", "Normal", "Enhancement", "Setup"];
const bugStatusOptions = ["Open", "Resolved","Closed", "Reopened", "New", "Assigned", "Verified"];
const resolutionOptions = ["Unresolved", "Wontfix", "Fixed", "Verified", "Closed", "Invalid", "Duplicate", "Worksforme", "Deferred", "Unconfirmed"];
const priorityOptions = ["P1", "P2", "P3", "P4", "P5"];
const componentOptions = ["MV", "MAN", "EXM", "API", "UI", "DB", "ALL"]; // Keep for reference if needed elsewhere
const osOptions = ["All", "Linux", "Windows", "MacOS"];

export const EditSirsReleaseDialog = ({
  open,
  onOpenChange,
  sirToEdit,
  onSave
}: EditSirsReleaseDialogProps) => {
  const [formData, setFormData] = useState<Partial<SirRelease>>({});

  useEffect(() => {
    if (sirToEdit) {
      setFormData({ ...sirToEdit });
    }
  }, [sirToEdit]);

  const handleInputChange = (field: keyof SirRelease, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    handleInputChange(id as keyof SirRelease, value);
  };

  const handleInputElementChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Handle numeric fields
    if (id === 'sir_id' || id === 'iteration') {
      handleInputChange(id as keyof SirRelease, value === '' ? '' : Number(value));
    } else {
      handleInputChange(id as keyof SirRelease, value);
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

      onSave({ ...sirToEdit, ...formData } as SirRelease);
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

  if (!sirToEdit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit SIR
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update SIR {sirToEdit?.sir_id} details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 w-full">
          {/* SIR Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="sir_release_id" className="text-sm font-medium text-gray-700">
                  SIR Release ID
                </Label>
                <Input
                  id="sir_release_id"
                  value={formData.sir_release_id || ''}
                  disabled
                  className="w-full bg-gray-100 text-gray-600"
                  placeholder="SIR Release ID"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="sir_id" className="text-sm font-medium text-gray-700">
                  SIR ID *
                </Label>
                <Input
                  id="sir_id"
                  type="number"
                  value={formData.sir_id || ''}
                  onChange={handleInputElementChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter SIR ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="release_version" className="text-sm font-medium text-gray-700">
                  Release Version *
                </Label>
                <Input
                  id="release_version"
                  value={formData.release_version || ''}
                  onChange={handleInputElementChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter release version"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                  Iteration
                </Label>
                <Input
                  id="iteration"
                  value={formData.iteration || ''}
                  onChange={handleInputElementChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter iteration"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="bug_severity" className="text-sm font-medium text-gray-700">
                  Bug Severity *
                </Label>
                <Select
                  value={formData.bug_severity || ''}
                  onValueChange={(value) => handleInputChange('bug_severity', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                    <SelectValue placeholder="Select bug severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {bugSeverityOptions.map((severity) => (
                      <SelectItem key={severity} value={severity.toLowerCase()}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                  Priority *
                </Label>
                <Select
                  value={formData.priority || ''}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700">
                  Assigned To
                </Label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={handleInputElementChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter assigned to email"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="bug_status" className="text-sm font-medium text-gray-700">
                  Bug Status *
                </Label>
                <Select
                  value={formData.bug_status || ''}
                  onValueChange={(value) => handleInputChange('bug_status', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                    <SelectValue placeholder="Select bug status" />
                  </SelectTrigger>
                  <SelectContent>
                    {bugStatusOptions.map((status) => (
                      <SelectItem key={status} value={status.toUpperCase().replace(' ', '_')}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="resolution" className="text-sm font-medium text-gray-700">
                  Resolution
                </Label>
                <Select
                  value={formData.resolution || ''}
                  onValueChange={(value) => handleInputChange('resolution', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    {resolutionOptions.map((resolution) => (
                      <SelectItem key={resolution} value={resolution.toUpperCase()}>
                        {resolution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="component" className="text-sm font-medium text-gray-700">
                  Component
                </Label>
                {/* Changed from Select to Input field */}
                <Input
                  id="component"
                  value={formData.component || ''}
                  onChange={handleInputElementChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter component"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="op_sys" className="text-sm font-medium text-gray-700">
                  Operating System
                </Label>
                <Select
                  value={formData.op_sys || ''}
                  onValueChange={(value) => handleInputChange('op_sys', value)}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                    <SelectValue placeholder="Select operating system" />
                  </SelectTrigger>
                  <SelectContent>
                    {osOptions.map((os) => (
                      <SelectItem key={os} value={os}>
                        {os}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="cf_sirwith" className="text-sm font-medium text-gray-700">
                  Cf Sir With
                </Label>
                <Input
                  id="cf_sirwith"
                  value={formData.cf_sirwith || ''}
                  onChange={handleInputElementChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="Enter cf sir with"
                />
              </div>
            </div>

            {/* Full Width Text Areas */}
            <div className="space-y-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="short_desc" className="text-sm font-medium text-gray-700">
                  Short Description *
                </Label>
                <Textarea
                  id="short_desc"
                  value={formData.short_desc || ''}
                  onChange={handleTextareaChange}
                  rows={3}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                  placeholder="Enter short description"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Changed Date
                </Label>
                <Input
                  value={formData.changed_date || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('changed_date', e.target.value)}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                  placeholder="YYYY-MM-DD HH:MM:SS"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
          <Button
            variant="outline"
            onClick={handleSaveAndClose}
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
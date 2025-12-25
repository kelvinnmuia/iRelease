import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MapSirsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMapSirs: (releaseVersion: string, iteration: string, sirs: string) => void;
}

export const MapSirsDialog = ({
  open,
  onOpenChange,
  onMapSirs
}: MapSirsDialogProps) => {
  const [releaseVersion, setReleaseVersion] = useState("");
  const [iteration, setIteration] = useState("");
  const [sirs, setSirs] = useState("");
  const [sirsCount, setSirsCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate SIRs count when sirs changes
  useEffect(() => {
    if (sirs.trim()) {
      const count = sirs.split(/[\n,]+/).filter(s => s.trim()).length;
      setSirsCount(count);
    } else {
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
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSirs(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Map SIRs</DialogTitle>
          <DialogDescription>
            Enter release version, iteration, and SIRs to map
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Release Version */}
          <div className="space-y-2">
            <Label htmlFor="releaseVersion" className="text-sm font-medium">
              Release Version
            </Label>
            <Input
              id="releaseVersion"
              value={releaseVersion}
              onChange={(e) => setReleaseVersion(e.target.value)}
              placeholder="e.g., 3.9.232.1"
              className="focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Iteration */}
          <div className="space-y-2">
            <Label htmlFor="iteration" className="text-sm font-medium">
              Iteration
            </Label>
            <Input
              id="iteration"
              value={iteration}
              onChange={(e) => setIteration(e.target.value)}
              placeholder="e.g., 2"
              className="focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* SIRs Text Area - Fixed size with scroll */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="sirs" className="text-sm font-medium">
                SIRs List
              </Label>
              {sirsCount > 0 && (
                <span className="text-xs text-gray-500">
                  {sirsCount} SIR{sirsCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                id="sirs"
                value={sirs}
                onChange={handleTextareaChange}
                placeholder={`Paste multiple SIRs (one per line or comma-separated)

e.g., 117773, 119176, 119431`}
                rows={8}
                className="w-full resize-none focus:ring-2 focus:ring-red-400 overflow-y-auto"
                style={{
                  height: '80px',
                  minHeight: '80px',
                  maxHeight: '80px',
                }}
              />
            </div>
            
            <p className="text-xs text-gray-500">
              You can paste SIRs separated by commas or new lines
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleMap}
            className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50"
          >
            Map
          </Button>
          <Button
            onClick={handleCancel}
            className="flex-1 bg-red-500 text-white hover:bg-red-600"
          >
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
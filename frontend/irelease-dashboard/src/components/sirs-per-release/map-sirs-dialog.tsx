import { useState } from "react";
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

  const handleMap = () => {
    if (releaseVersion.trim() && iteration.trim() && sirs.trim()) {
      onMapSirs(releaseVersion, iteration, sirs);
      // Reset form
      setReleaseVersion("");
      setIteration("");
      setSirs("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setReleaseVersion("");
    setIteration("");
    setSirs("");
    onOpenChange(false);
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

          {/* SIRs Text Area */}
          <div className="space-y-2">
            <Label htmlFor="sirs" className="text-sm font-medium">
              SIRs List
            </Label>
            <Textarea
              id="sirs"
              value={sirs}
              onChange={(e) => setSirs(e.target.value)}
              placeholder="Paste multiple SIRs (one per line or comma-separated)"
              rows={6}
              className="resize-none focus:ring-2 focus:ring-red-400"
            />
            <p className="text-xs text-gray-500">
              You can paste SIRs separated by commas, spaces, or new lines
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMap}
            className="flex-1 bg-red-500 text-white hover:bg-red-600"
          >
            Map
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
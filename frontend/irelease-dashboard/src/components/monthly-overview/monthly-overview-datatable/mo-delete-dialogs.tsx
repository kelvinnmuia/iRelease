import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Release } from "./types/mo-releases";

interface DeleteDialogsProps {
  bulkDeleteOpen: boolean;
  setBulkDeleteOpen: (open: boolean) => void;
  singleDeleteOpen: boolean;
  setSingleDeleteOpen: (open: boolean) => void;
  releaseToDelete: Release | null;
  selectedRowsCount: number;
  onBulkDelete: () => void;
  onSingleDelete: () => void;
}

export const DeleteDialogs = ({
  bulkDeleteOpen,
  setBulkDeleteOpen,
  singleDeleteOpen,
  setSingleDeleteOpen,
  releaseToDelete,
  selectedRowsCount,
  onBulkDelete,
  onSingleDelete
}: DeleteDialogsProps) => {
  return (
    <>
      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRowsCount} selected release(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              No, Cancel
            </Button>
            <Button
              onClick={onBulkDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Yes, Delete {selectedRowsCount} Release(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete release {releaseToDelete?.releaseVersion}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSingleDeleteOpen(false)}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              No, Cancel
            </Button>
            <Button
              onClick={onSingleDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReleasesPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  startIndex: number;
  onPageChange: (page: number) => void;
}

export const ReleasesPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  onPageChange
}: ReleasesPaginationProps) => {
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    const ellipsis = "...";
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(ellipsis);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(ellipsis);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(ellipsis);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(ellipsis);
        pages.push(totalPages);
      }
    }
    
    return pages.map((page, index) => {
      if (page === ellipsis) {
        return (
          <span
            key={`ellipsis-${index}`}
            className="min-w-9 h-9 flex items-center justify-center text-gray-500 px-2"
          >
            {ellipsis}
          </span>
        );
      }
      
      return (
        <Button
          key={page}
          size="sm"
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => onPageChange(page as number)}
          className={`min-w-9 h-9 p-0 ${
            currentPage === page 
              ? "bg-red-500 text-white hover:bg-red-600 border-red-500" 
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {page}
        </Button>
      );
    });
  };

  return (
    <div className="border-t border-gray-200 px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-600 text-center sm:text-left">
        Viewing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
        <span className="ml-2">• {visibleColumns.length} columns visible</span>
      </div>
      
      {/* Enhanced Pagination */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {renderPageNumbers()}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
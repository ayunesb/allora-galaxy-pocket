
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface LogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function LogPagination({ currentPage, totalPages, onPageChange }: LogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pagesToShow = [1, totalPages];
            if (currentPage > 1) pagesToShow.push(currentPage);
            if (currentPage > 2) pagesToShow.push(currentPage - 1);
            if (currentPage < totalPages - 1) pagesToShow.push(currentPage + 1);
            
            const uniquePages = Array.from(new Set(pagesToShow)).sort((a, b) => a - b);
            
            const paginationItems = [];
            let prevPage = 0;
            
            uniquePages.forEach(pageNum => {
              if (pageNum - prevPage > 1) {
                paginationItems.push(
                  <PaginationItem key={`ellipsis-${pageNum}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              paginationItems.push(
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(pageNum);
                    }}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
              
              prevPage = pageNum;
            });
            
            return paginationItems;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

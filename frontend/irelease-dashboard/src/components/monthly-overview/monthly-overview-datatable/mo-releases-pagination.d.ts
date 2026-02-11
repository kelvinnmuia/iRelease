interface ReleasesPaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    startIndex: number;
    onPageChange: (page: number) => void;
    visibleColumnsCount: number;
}
export declare const ReleasesPagination: ({ currentPage, totalPages, itemsPerPage, totalItems, startIndex, onPageChange, visibleColumnsCount, }: ReleasesPaginationProps) => import("react/jsx-runtime").JSX.Element;
export {};

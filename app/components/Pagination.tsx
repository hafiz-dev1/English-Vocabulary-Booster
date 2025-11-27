interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
      >
        Previous
      </button>

      <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
      >
        Next
      </button>
    </div>
  );
}

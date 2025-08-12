type Props = {
  page: number;
  total: number;
  setPage: (val: number) => void;
};

export default function Pagination({ page, total, setPage }: Props) {
  const totalPages = Math.ceil(total / 10);
  return (
    <div className="mt-4 flex gap-2">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1 border rounded"
      >
        Prev
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 border rounded"
      >
        Next
      </button>
    </div>
  );
}

import { useState } from 'react';

/** Page state for paginated lists; filters reset the page to 1 */
export function usePage(initial = 1) {
  const [page, setPage] = useState(initial);
  return { page, setPage, reset: () => setPage(1) };
}

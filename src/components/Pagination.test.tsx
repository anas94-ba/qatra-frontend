import { fireEvent, render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';

const meta = { total: 25, page: 2, pageSize: 10, totalPages: 3, hasNext: true, hasPrev: true };

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination meta={{ ...meta, totalPages: 1, hasNext: false, hasPrev: false }} onPage={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onPage with the adjacent pages', () => {
    const onPage = vi.fn();
    render(<Pagination meta={meta} onPage={onPage} />);
    fireEvent.click(screen.getByText('التالي'));
    fireEvent.click(screen.getByText('السابق'));
    expect(onPage).toHaveBeenNthCalledWith(1, 3);
    expect(onPage).toHaveBeenNthCalledWith(2, 1);
  });

  it('disables the previous button on the first page', () => {
    render(<Pagination meta={{ ...meta, page: 1, hasPrev: false }} onPage={() => {}} />);
    expect(screen.getByText('السابق')).toBeDisabled();
  });
});

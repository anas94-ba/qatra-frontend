import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Session } from '../../api/types';
import { RequireRole } from './RequireRole';

let session: Session | null = null;
vi.mock('./AuthContext', async () => ({
  useAuth: () => ({ session, loading: false }),
  landingPath: (s: Session) => (s.landing === 'PENDING' ? '/status/pending' : '/camp'),
  homeFor: (role: string) => ({ ADMIN: '/admin', ORG: '/org', CAMP_REP: '/camp' })[role as 'ADMIN'],
}));

const user = { id: '1', email: 'a@b.c', fullName: 'x', campId: null, organizationId: null, mustChangePassword: false };

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/status/pending" element={<div>pending page</div>} />
        <Route path="/admin" element={<div>admin home</div>} />
        <Route element={<RequireRole role="CAMP_REP" />}>
          <Route path="/camp" element={<div>camp home</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  it('redirects anonymous visitors to the login page', () => {
    session = null;
    renderAt('/camp');
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('sends unapproved accounts to their status page', () => {
    session = { user: { ...user, role: 'CAMP_REP' }, landing: 'PENDING', landingData: null };
    renderAt('/camp');
    expect(screen.getByText('pending page')).toBeInTheDocument();
  });

  it('sends a user with another role to their own dashboard', () => {
    session = { user: { ...user, role: 'ADMIN' }, landing: 'DASHBOARD', landingData: null };
    renderAt('/camp');
    expect(screen.getByText('admin home')).toBeInTheDocument();
  });

  it('renders the page for the right role', () => {
    session = { user: { ...user, role: 'CAMP_REP' }, landing: 'DASHBOARD', landingData: null };
    renderAt('/camp');
    expect(screen.getByText('camp home')).toBeInTheDocument();
  });
});

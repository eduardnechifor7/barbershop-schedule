import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
    it('highlights the correct tab based on the current route', () => {
        render(
            <MemoryRouter initialEntries={['/bookings']}>
                <BottomNav />
            </MemoryRouter>
        );

        const bookingLabel = screen.getByText('Bookings');
        expect(bookingLabel).toHaveClass('text-brand-gold');
        expect(bookingLabel).not.toHaveClass('text-gray-pc');

        const homeLabel = screen.getByText('Home');
        expect(homeLabel).toHaveClass('text-gray-pc');
        expect(homeLabel).not.toHaveClass('text-brand-gold');
    });

    it('navigates to the correct route when a tab is clicked', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/customer']}>
                <BottomNav />
                <Routes>
                    <Route path="/customer" element={<div>Home Page</div>} />
                    <Route path="/explore" element={<div>Explore Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        const exploreButton = screen.getByRole('button', { name: /explore/i });
        await user.click(exploreButton);

        expect(screen.getByText('Explore Page')).toBeInTheDocument();
    });
});

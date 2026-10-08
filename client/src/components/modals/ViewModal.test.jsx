import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewModal } from './ViewModal';

describe('ViewModal', () => {
    // ==========================================
    // 1. RENDERING SUITE
    // ==========================================
    describe('Rendering', () => {
        it('returns null and renders nothing when isOpen is false', () => {
            const { container } = render(
                <ViewModal isOpen={false} onClose={vi.fn()} config={{}} user={{}} />
            );
            expect(container).toBeEmptyDOMElement();
        });

        it('renders modal title, labels, and properly formatted values for standard fields', () => {
            const config = {
                'Client Name': ['first_name', 'last_name'],
                'Appointment Date': 'appointment_date',
                'Start time': 'start_time',
                'Price': 'price',
                'Duration': 'minutes_duration',
                'Notes': 'notes',
            };

            const user = {
                first_name: 'John',
                last_name: 'Doe',
                appointment_date: '2026-10-15T00:00:00.000Z',
                start_time: '14:30:00',
                price: 75,
                minutes_duration: 45,
                notes: null, // Should fallback to '-'
            };

            render(<ViewModal isOpen={true} onClose={vi.fn()} config={config} user={user} />);

            expect(screen.getByRole('heading', { level: 2, name: 'Details' })).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('14:30')).toBeInTheDocument();
            expect(screen.getByText('75 RON')).toBeInTheDocument();
            expect(screen.getByText('45 minutes')).toBeInTheDocument();
            expect(screen.getByText('-')).toBeInTheDocument(); // Notes fallback
            expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
        });

        it('renders image when Photo URL is provided and renders fallback user icon when missing', () => {
            const photoConfig = { 'Photo URL': 'photo_url' };

            const { rerender } = render(
                <ViewModal
                    isOpen={true}
                    onClose={vi.fn()}
                    config={photoConfig}
                    user={{ photo_url: 'https://example.com/photo.jpg' }}
                />
            );

            const img = screen.getByRole('img', { name: 'Profil' });
            expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');

            rerender(
                <ViewModal
                    isOpen={true}
                    onClose={vi.fn()}
                    config={photoConfig}
                    user={{ photo_url: null }}
                />
            );

            expect(screen.queryByRole('img', { name: 'Profil' })).not.toBeInTheDocument();
        });

        it('renders correct status badges and icons across different status values', () => {
            const statusConfig = { Status: 'status' };

            // 1. Completed / Active status
            const { rerender } = render(
                <ViewModal
                    isOpen={true}
                    onClose={vi.fn()}
                    config={statusConfig}
                    user={{ status: 'completed' }}
                />
            );
            const completedBadge = screen.getByText('completed');
            expect(completedBadge).toHaveClass('text-emerald-400');

            // 2. Cancelled / Inactive status
            rerender(
                <ViewModal
                    isOpen={true}
                    onClose={vi.fn()}
                    config={statusConfig}
                    user={{ status: 'cancelled' }}
                />
            );
            const cancelledBadge = screen.getByText('cancelled');
            expect(cancelledBadge).toHaveClass('text-red-400');

            // 3. Other / Scheduled status
            rerender(
                <ViewModal
                    isOpen={true}
                    onClose={vi.fn()}
                    config={statusConfig}
                    user={{ status: 'scheduled' }}
                />
            );
            const scheduledBadge = screen.getByText('scheduled');
            expect(scheduledBadge).toHaveClass('text-amber-400');
        });

        it('renders item tags for Services and Skills, and fallback dash when empty', () => {
            const listConfig = {
                Services: 'services',
                Skills: 'skills',
            };

            const userWithLists = {
                services: [{ service_name: 'Haircut', price_at_booking: 50 }],
                skills: [{ name: 'Fades' }],
            };

            const { rerender } = render(
                <ViewModal
                    isOpen={true}
                    onClose={vi.fn()}
                    config={listConfig}
                    user={userWithLists}
                />
            );

            expect(screen.getByText('Haircut • 50 RON')).toBeInTheDocument();
            expect(screen.getByText('Fades')).toBeInTheDocument();

            // When services and skills are empty arrays
            rerender(
                <ViewModal
                    isOpen={true}
                    onClose={vi.fn()}
                    config={listConfig}
                    user={{ services: [], skills: [] }}
                />
            );

            const dashes = screen.getAllByText('-');
            expect(dashes.length).toBe(2);
        });
    });

    // ==========================================
    // 2. DISMISSAL SUITE
    // ==========================================
    describe('Dismissal', () => {
        it('calls onClose callback when clicking the header close icon or the bottom Close button', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            render(
                <ViewModal
                    isOpen={true}
                    onClose={onClose}
                    config={{ Notes: 'notes' }}
                    user={{ notes: 'Sample note' }}
                />
            );

            // Click header close button (the first button with X icon)
            const headerCloseBtn = screen.getAllByRole('button')[0];
            await user.click(headerCloseBtn);
            expect(onClose).toHaveBeenCalledTimes(1);

            // Click bottom "Close" button
            const bottomCloseBtn = screen.getByRole('button', { name: 'Close' });
            await user.click(bottomCloseBtn);
            expect(onClose).toHaveBeenCalledTimes(2);
        });
    });
});

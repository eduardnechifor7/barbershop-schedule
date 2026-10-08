import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsModal } from './NotificationsModal';

describe('NotificationsModal', () => {
    const mockNotifications = [
        {
            id: 1,
            title: 'Appointment Reminder',
            message: 'You have a booking tomorrow at 10:00.',
            is_read: false,
            created_at: '2026-10-08T08:00:00.000Z',
        },
        {
            id: 2,
            title: 'Special Promotion',
            message: 'Get 20% off beard trims this week.',
            is_read: true,
            created_at: '2026-10-05T12:00:00.000Z',
        },
    ];

    // ==========================================
    // 1. RENDERING SUITE
    // ==========================================
    describe('Rendering', () => {
        it('returns null and renders nothing when isOpen is false', () => {
            const { container } = render(
                <NotificationsModal isOpen={false} onClose={vi.fn()} />
            );
            expect(container).toBeEmptyDOMElement();
        });

        it('renders empty state message and hides "Read all" button when there are no notifications', () => {
            render(
                <NotificationsModal
                    isOpen={true}
                    notifications={[]}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByRole('heading', { level: 2, name: 'Notifications' })).toBeInTheDocument();
            expect(screen.getByText('You are all caught up')).toBeInTheDocument();
            expect(screen.getByText('No notifications yet')).toBeInTheDocument();
            expect(
                screen.getByText("We'll notify you about appointments and schedule updates here.")
            ).toBeInTheDocument();
            expect(screen.queryByTitle('Mark all as read')).not.toBeInTheDocument();
        });

        it('renders notification items, action button, and unread count header', () => {
            const { rerender } = render(
                <NotificationsModal
                    isOpen={true}
                    notifications={mockNotifications}
                    onClose={vi.fn()}
                />
            );

            // Single unread update
            expect(screen.getByText('1 unread update')).toBeInTheDocument();
            expect(screen.getByTitle('Mark all as read')).toBeInTheDocument();

            // Render notification contents
            expect(screen.getByText('Appointment Reminder')).toBeInTheDocument();
            expect(screen.getByText('You have a booking tomorrow at 10:00.')).toBeInTheDocument();
            expect(screen.getByText('Special Promotion')).toBeInTheDocument();
            expect(screen.getByText('Get 20% off beard trims this week.')).toBeInTheDocument();

            // Plural unread updates
            const multipleUnread = [
                ...mockNotifications,
                { id: 3, title: 'Schedule Update', message: 'Time changed', is_read: false },
            ];
            rerender(
                <NotificationsModal
                    isOpen={true}
                    notifications={multipleUnread}
                    onClose={vi.fn()}
                />
            );
            expect(screen.getByText('2 unread updates')).toBeInTheDocument();
        });
    });

    // ==========================================
    // 2. USER INTERACTIONS SUITE
    // ==========================================
    describe('User Interactions', () => {
        it('calls onMarkAllAsRead when clicking "Read all" and calls onClose when clicking close icon', async () => {
            const user = userEvent.setup();
            const onMarkAllAsRead = vi.fn();
            const onClose = vi.fn();

            render(
                <NotificationsModal
                    isOpen={true}
                    notifications={mockNotifications}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onClose={onClose}
                />
            );

            // Click "Read all"
            await user.click(screen.getByTitle('Mark all as read'));
            expect(onMarkAllAsRead).toHaveBeenCalledTimes(1);

            // Click Close button (the X icon button)
            const buttons = screen.getAllByRole('button');
            const closeBtn = buttons[buttons.length - 3]; // Close button is before the item delete buttons
            await user.click(closeBtn);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onNotificationClick for unread notification but ignores clicks on read notification', async () => {
            const user = userEvent.setup();
            const onNotificationClick = vi.fn();

            render(
                <NotificationsModal
                    isOpen={true}
                    notifications={mockNotifications}
                    onNotificationClick={onNotificationClick}
                    onClose={vi.fn()}
                />
            );

            // Click unread notification (Appointment Reminder)
            await user.click(screen.getByText('Appointment Reminder'));
            expect(onNotificationClick).toHaveBeenCalledTimes(1);
            expect(onNotificationClick).toHaveBeenCalledWith(mockNotifications[0]);

            // Click read notification (Special Promotion)
            await user.click(screen.getByText('Special Promotion'));
            expect(onNotificationClick).toHaveBeenCalledTimes(1); // Still 1, not called for read item
        });

        it('calls onDeleteNotification with notification ID and stops propagation to onNotificationClick', async () => {
            const user = userEvent.setup();
            const onDeleteNotification = vi.fn();
            const onNotificationClick = vi.fn();

            render(
                <NotificationsModal
                    isOpen={true}
                    notifications={mockNotifications}
                    onDeleteNotification={onDeleteNotification}
                    onNotificationClick={onNotificationClick}
                    onClose={vi.fn()}
                />
            );

            const deleteButtons = screen.getAllByTitle('Delete notification');
            await user.click(deleteButtons[0]);

            expect(onDeleteNotification).toHaveBeenCalledTimes(1);
            expect(onDeleteNotification).toHaveBeenCalledWith(1);
            expect(onNotificationClick).not.toHaveBeenCalled();
        });
    });
});

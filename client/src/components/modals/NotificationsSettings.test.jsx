import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsSettings } from './NotificationsSettings';

describe('NotificationsSettings', () => {
    const defaultPreferences = {
        in_app_notifications: true,
        email_notifications: false,
        sms_notifications: true,
    };

    // ==========================================
    // 1. RENDERING SUITE
    // ==========================================
    describe('Rendering', () => {
        /**
         * Bug it catches:
         * Prevents modal DOM elements or backdrop from lingering when isOpen is false.
         */
        it('returns null and renders nothing when isOpen is false', () => {
            const { container } = render(
                <NotificationsSettings
                    isOpen={false}
                    onClose={vi.fn()}
                    preferences={defaultPreferences}
                    setUser={vi.fn()}
                />
            );
            expect(container).toBeEmptyDOMElement();
        });

        /**
         * Bug it catches:
         * Prevents omitting preference options, titles, descriptions, or visual toggle states.
         */
        it('renders modal header, all 3 notification preference items, and correct toggle visual states', () => {
            const { container } = render(
                <NotificationsSettings
                    isOpen={true}
                    onClose={vi.fn()}
                    preferences={defaultPreferences}
                    setUser={vi.fn()}
                />
            );

            // Header elements
            expect(screen.getByRole('heading', { level: 2, name: 'Notification Settings' })).toBeInTheDocument();
            expect(screen.getByText('Choose how you want to receive updates')).toBeInTheDocument();

            // All 3 settings titles and descriptions
            expect(screen.getByText('In-App Alerts')).toBeInTheDocument();
            expect(screen.getByText('Receive real-time booking updates inside the app.')).toBeInTheDocument();

            expect(screen.getByText('Email Reminders')).toBeInTheDocument();
            expect(screen.getByText('Get confirmation of appointments via email.')).toBeInTheDocument();

            expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
            expect(screen.getByText('Direct text messages with quick reminders before your appointment.')).toBeInTheDocument();

            // Active toggle styling (bg-brand-gold) vs inactive (bg-white/10)
            const activeToggles = container.querySelectorAll('.bg-brand-gold');
            expect(activeToggles.length).toBe(2); // in_app and sms are true

            const inactiveToggles = container.querySelectorAll('.bg-white\\/10');
            expect(inactiveToggles.length).toBe(1); // email is false
        });

        /**
         * Bug it catches:
         * Prevents dismissal button (X icon) from failing to call onClose.
         */
        it('calls onClose callback when clicking the header close button', async () => {
            const user = userEvent.setup();
            const onCloseMock = vi.fn();

            render(
                <NotificationsSettings
                    isOpen={true}
                    onClose={onCloseMock}
                    preferences={defaultPreferences}
                    setUser={vi.fn()}
                />
            );

            const closeButton = screen.getByRole('button');
            await user.click(closeButton);

            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });
    });

    // ==========================================
    // 2. USER INTERACTIONS & API INTEGRATION SUITE
    // ==========================================
    describe('User Interactions & API Updates', () => {
        /**
         * Bug it catches:
         * Prevents toggle click from passing wrong key or non-inverted boolean to setUser.
         */
        it('toggles setting and triggers setUser with inverted boolean value when an option is clicked', async () => {
            const user = userEvent.setup();
            const setUserMock = vi.fn();

            render(
                <NotificationsSettings
                    isOpen={true}
                    onClose={vi.fn()}
                    preferences={defaultPreferences}
                    setUser={setUserMock}
                />
            );

            // Click active setting (in_app_notifications: true -> false)
            await user.click(screen.getByText('In-App Alerts'));
            expect(setUserMock).toHaveBeenCalledWith('in_app_notifications', false);

            // Click inactive setting (email_notifications: false -> true)
            await user.click(screen.getByText('Email Reminders'));
            expect(setUserMock).toHaveBeenCalledWith('email_notifications', true);

            // Click active setting (sms_notifications: true -> false)
            await user.click(screen.getByText('SMS Notifications'));
            expect(setUserMock).toHaveBeenCalledWith('sms_notifications', false);

            expect(setUserMock).toHaveBeenCalledTimes(3);
        });

        /**
         * Bug it catches:
         * Prevents failure or unhandled promise when setUser performs an async API mutation.
         */
        it('successfully executes async API update handler when a notification toggle is clicked', async () => {
            const user = userEvent.setup();
            const asyncApiHandler = vi.fn().mockResolvedValue({ success: true });

            render(
                <NotificationsSettings
                    isOpen={true}
                    onClose={vi.fn()}
                    preferences={defaultPreferences}
                    setUser={asyncApiHandler}
                />
            );

            await user.click(screen.getByText('Email Reminders'));

            expect(asyncApiHandler).toHaveBeenCalledTimes(1);
            expect(asyncApiHandler).toHaveBeenCalledWith('email_notifications', true);
        });

        /**
         * Bug it catches:
         * Prevents component from crashing with TypeError if setUser prop is omitted.
         */
        it('does not crash when clicked and setUser prop is not provided', async () => {
            const user = userEvent.setup();

            render(
                <NotificationsSettings
                    isOpen={true}
                    onClose={vi.fn()}
                    preferences={defaultPreferences}
                />
            );

            // Should not throw
            await expect(user.click(screen.getByText('In-App Alerts'))).resolves.not.toThrow();
        });
    });
});

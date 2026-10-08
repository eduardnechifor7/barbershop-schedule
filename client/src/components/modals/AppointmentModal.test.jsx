import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentModal } from './AppointmentModal';
import { appointmentService } from '../../services/appointmentService';


// Mock appointmentService.getOccupiedTimes as required
vi.mock('../../services/appointmentService', () => ({
    appointmentService: {
        getOccupiedTimes: vi.fn(),
    },
}));

// Helper to compute a guaranteed future weekday (Monday-Friday)
// Ensures availableTimeSlots calculation returns slots regardless of run-time or timezone
const getFutureWeekday = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const day = date.getDay();
    if (day === 0) date.setDate(date.getDate() + 1); // Sunday -> Monday
    if (day === 6) date.setDate(date.getDate() + 2); // Saturday -> Monday
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayNum}`;
};

const mockBarbers = [
    {
        id: 1,
        first_name: 'Bob',
        last_name: 'Ross',
        skills_ids: [{ id: 101 }],
    },
    {
        id: 2,
        first_name: 'Charlie',
        last_name: 'Brown',
        skills_ids: [{ id: 101 }, { id: 102 }],
    },
];

const mockServices = [
    {
        id: 10,
        service_id: 10,
        service_name: 'Haircut',
        price: 50,
        minutes_duration: 30,
        skills_ids: [{ id: 101 }],
    },
    {
        id: 20,
        service_id: 20,
        service_name: 'Beard Trim',
        price: 30,
        minutes_duration: 15,
        skills_ids: [{ id: 101 }],
    },
    {
        id: 30,
        service_id: 30,
        service_name: 'Coloring',
        price: 100,
        minutes_duration: 60,
        skills_ids: [{ id: 102 }],
    },
];

const mockUsers = [
    {
        id: 100,
        first_name: 'Alice',
        last_name: 'Smith',
    },
    {
        id: 101,
        first_name: 'David',
        last_name: 'Miller',
    },
];

describe('AppointmentModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        appointmentService.getOccupiedTimes.mockResolvedValue([]);
    });

    // ==========================================
    // 1. RENDERING SUITE
    // ==========================================
    describe('Rendering', () => {
        /**
         * Bug it catches:
         * Prevents rendering the wrong modal header ("Edit Appointment") in create mode,
         * or omitting essential dialog buttons ("Create Appointment", "Cancel", close icon).
         */
        it('renders modal title "New Appointment", form fields, and default action buttons in create mode', async () => {
            const { container } = render(
                <AppointmentModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalled();
            });

            expect(screen.getByRole('heading', { level: 2, name: 'New Appointment' })).toBeInTheDocument();
            expect(screen.getByText('Select client...')).toBeInTheDocument();
            expect(screen.getByText('Select services...')).toBeInTheDocument();
            expect(container.querySelector('input[type="date"]')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Optional notes...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create Appointment' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

            // Header close button containing the X icon
            const closeButtons = screen.getAllByRole('button');
            expect(closeButtons[0]).toBeInTheDocument();
        });

        /**
         * Bug it catches:
         * Prevents edit mode from failing to hydrate existing appointment fields
         * (client, services, date, time slot, notes) or displaying "Create Appointment" instead of "Save Changes".
         */
        it('renders modal title "Edit Appointment" and pre-populates existing appointment data in edit mode', async () => {
            const initialData = {
                id: 999,
                barber_id: 1,
                user_id: 100,
                appointment_date: '2026-10-20',
                start_time: '14:30:00',
                notes: 'Existing special request',
                services: [{ service_id: 10, service_name: 'Haircut', price: 50 }],
            };

            const { container } = render(
                <AppointmentModal
                    isOpen={true}
                    isEdit={true}
                    initialData={initialData}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalled();
            });

            expect(screen.getByRole('heading', { level: 2, name: 'Edit Appointment' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
            expect(screen.getByText('Alice Smith')).toBeInTheDocument();
            expect(screen.getByText('Haircut - 50 RON')).toBeInTheDocument();
            expect(container.querySelector('input[type="date"]').value).toBe('2026-10-20');
            expect(screen.getByText('14:30')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Optional notes...').value).toBe('Existing special request');
        });

        /**
         * Bug it catches:
         * Prevents an authorization leak where standard customers see/select barbers directly,
         * or prevents admins from being unable to view the barber selector dropdown.
         */
        it('renders barber selection dropdown when isAdmin is true, and hides it when isAdmin is false', async () => {
            const { rerender } = render(
                <AppointmentModal
                    isOpen={true}
                    isAdmin={false}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalled();
            });

            expect(screen.queryByText('Barber')).not.toBeInTheDocument();
            expect(screen.queryByText('Select barber...')).not.toBeInTheDocument();

            rerender(
                <AppointmentModal
                    isOpen={true}
                    isAdmin={true}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            expect(screen.getByText('Barber')).toBeInTheDocument();
            expect(screen.getByText('Bob Ross')).toBeInTheDocument();
        });

        /**
         * Bug it catches:
         * Prevents the Cancel button from malfunctioning or triggering accidental form submissions.
         */
        it('calls onClose callback when clicking the Cancel button', async () => {
            const user = userEvent.setup();
            const onCloseMock = vi.fn();

            render(
                <AppointmentModal
                    isOpen={true}
                    onClose={onCloseMock}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
            await user.click(cancelBtn);

            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });
    });

    // ==========================================
    // 2. VALIDATION SUITE
    // ==========================================
    describe('Validation', () => {
        /**
         * Bug it catches:
         * Prevents submitting an empty form missing client, services, and time slot,
         * which would lead to corrupt database records or backend 400 Bad Request errors.
         */
        it('displays validation error messages for required fields when submitting an empty form in create mode', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn();

            render(
                <AppointmentModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSubmit={onSubmitMock}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            await user.click(screen.getByRole('button', { name: 'Create Appointment' }));

            const errorMessages = screen.getAllByText('• This field is required');
            expect(errorMessages.length).toBe(3); // client, services, time slot
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        /**
         * Bug it catches:
         * Prevents administrators from submitting an appointment without selecting a barber
         * when isAdmin is true, catching omissions in activeRules merging.
         */
        it('displays validation error for barber when isAdmin is true and no barber is selected', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn();

            render(
                <AppointmentModal
                    isOpen={true}
                    isAdmin={true}
                    onClose={vi.fn()}
                    onSubmit={onSubmitMock}
                    parsedData={{ barbers: [], services: mockServices, users: mockUsers }}
                />
            );

            await user.click(screen.getByRole('button', { name: 'Create Appointment' }));

            const errorMessages = screen.getAllByText('• This field is required');
            expect(errorMessages.length).toBe(4); // client, services, barber, time slot
            expect(onSubmitMock).not.toHaveBeenCalled();
        });


        /**
         * Bug it catches:
         * Catches cases where validation errors appear visually in the UI,
         * but the form still executes onSubmit in the background.
         */
        it('blocks onSubmit from firing when any validation rule is violated', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn();

            render(
                <AppointmentModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSubmit={onSubmitMock}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            // Select only client, leaving services and time slot empty
            await user.click(screen.getByText('Select client...'));
            await user.click(await screen.findByText('Alice Smith'));

            await user.click(screen.getByRole('button', { name: 'Create Appointment' }));

            expect(onSubmitMock).not.toHaveBeenCalled();
            expect(screen.getAllByText('• This field is required').length).toBe(2); // services & time slot
        });


        /**
         * Bug it catches:
         * Prevents scheduling services that the selected barber does not have skills to perform.
         */
        it('filters available services to only those matching the selected barber skills', async () => {
            const user = userEvent.setup();

            render(
                <AppointmentModal
                    isOpen={true}
                    isAdmin={true}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            // Bob Ross (barber[0]) only has skill 101.
            // Haircut (101) and Beard Trim (101) should be shown, but Coloring (102) must be excluded.
            await user.click(screen.getByText('Select services...'));
            expect(await screen.findByText('Haircut - 50 RON')).toBeInTheDocument();
            expect(screen.getByText('Beard Trim - 30 RON')).toBeInTheDocument();
            expect(screen.queryByText('Coloring - 100 RON')).not.toBeInTheDocument();

            // Switch to Charlie Brown (skills 101 and 102)
            await user.click(screen.getByText('Bob Ross'));
            await user.click(await screen.findByText('Charlie Brown'));

            // Open services select again - Coloring should now be available
            await user.click(screen.getByText('Select services...'));
            expect(await screen.findByText('Coloring - 100 RON')).toBeInTheDocument();
        });

        /**
         * Bug it catches:
         * Prevents scheduling an unqualified barber when specific services have already been selected.
         */
        it('filters available barbers to only those qualified to perform all selected services', async () => {
            const user = userEvent.setup();

            render(
                <AppointmentModal
                    isOpen={true}
                    isAdmin={true}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            // Charlie Brown has skills 101 and 102; select Charlie first so Coloring is visible
            await user.click(screen.getByText('Bob Ross'));
            await user.click(await screen.findByRole('option', { name: 'Charlie Brown' }));

            // Select Coloring (requires skill 102)
            await user.click(screen.getByText('Select services...'));
            await user.click(await screen.findByRole('option', { name: /Coloring - 100 RON/i }));

            // Check barber dropdown options: Bob Ross (only skill 101) should not be available
            await user.click(screen.getByText('Charlie Brown'));
            expect(await screen.findByRole('option', { name: 'Charlie Brown' })).toBeInTheDocument();
            expect(screen.queryByRole('option', { name: 'Bob Ross' })).not.toBeInTheDocument();
        });
    });

    // ==========================================
    // 3. SUBMISSION SUITE
    // ==========================================
    describe('Submission', () => {
        /**
         * Bug it catches:
         * Prevents submitting a malformed payload (wrong IDs, missing dates or notes)
         * or failing to trigger onClose after successful creation.
         */
        it('submits correct form payload and triggers onClose upon successful create submission', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn().mockResolvedValue(undefined);
            const onCloseMock = vi.fn();
            const futureDate = getFutureWeekday();

            const { container } = render(
                <AppointmentModal
                    isOpen={true}
                    onClose={onCloseMock}
                    onSubmit={onSubmitMock}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            // Select client
            await user.click(screen.getByText('Select client...'));
            await user.click(await screen.findByText('Alice Smith'));

            // Select services
            await user.click(screen.getByText('Select services...'));
            await user.click(await screen.findByText('Haircut - 50 RON'));

            // Set date to a future weekday
            const dateInput = container.querySelector('input[type="date"]');
            await user.clear(dateInput);
            await user.type(dateInput, futureDate);

            // Select time slot
            await user.click(await screen.findByText('Select time...'));
            await user.click(await screen.findByText('09:00'));

            // Type optional notes
            const notesInput = screen.getByPlaceholderText('Optional notes...');
            await user.type(notesInput, 'Please be gentle');

            // Click submit button
            const submitBtn = screen.getByRole('button', { name: 'Create Appointment' });
            await user.click(submitBtn);

            await waitFor(() => {
                expect(onSubmitMock).toHaveBeenCalledWith({
                    user_id: 100,
                    service_ids: [10],
                    barber_id: 1,
                    appointment_date: futureDate,
                    start_time: '09:00',
                    notes: 'Please be gentle',
                });
            });

            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });

        /**
         * Bug it catches:
         * Prevents edit mode from submitting stale initialData rather than modified form values,
         * and ensures the modal dismisses after editing.
         */
        it('submits modified form payload and triggers onClose upon successful edit submission', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn().mockResolvedValue(undefined);
            const onCloseMock = vi.fn();
            const futureDate = getFutureWeekday();

            const initialData = {
                id: 55,
                barber_id: 1,
                user_id: 100,
                appointment_date: futureDate,
                start_time: '10:00:00',
                notes: 'Old notes',
                services: [{ service_id: 10, service_name: 'Haircut', price: 50 }],
            };

            render(
                <AppointmentModal
                    isOpen={true}
                    isEdit={true}
                    initialData={initialData}
                    onClose={onCloseMock}
                    onSubmit={onSubmitMock}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalled();
            });

            // Modify client to David Miller
            await user.click(screen.getByText('Alice Smith'));
            await user.click(await screen.findByText('David Miller'));

            // Modify notes
            const notesInput = screen.getByPlaceholderText('Optional notes...');
            await user.clear(notesInput);
            await user.type(notesInput, 'Updated special instructions');

            // Submit changes
            const saveBtn = screen.getByRole('button', { name: 'Save Changes' });
            await user.click(saveBtn);

            await waitFor(() => {
                expect(onSubmitMock).toHaveBeenCalledWith({
                    user_id: 101,
                    service_ids: [10],
                    barber_id: 1,
                    appointment_date: futureDate,
                    start_time: '10:00',
                    notes: 'Updated special instructions',
                });
            });

            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });
    });

    // ==========================================
    // 4. ERROR HANDLING SUITE
    // ==========================================
    describe('Error handling', () => {
        /**
         * Bug it catches:
         * Prevents silent submission failures where an API/network error rejects
         * without notifying the user via the error toast.
         */
        it('displays error toast notification when onSubmit rejects', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn().mockRejectedValue(new Error('Server unavailable'));
            const futureDate = getFutureWeekday();

            const { container } = render(
                <AppointmentModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSubmit={onSubmitMock}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            // Fill required fields
            await user.click(screen.getByText('Select client...'));
            await user.click(await screen.findByText('Alice Smith'));

            await user.click(screen.getByText('Select services...'));
            await user.click(await screen.findByText('Haircut - 50 RON'));

            const dateInput = container.querySelector('input[type="date"]');
            await user.clear(dateInput);
            await user.type(dateInput, futureDate);

            await user.click(await screen.findByText('Select time...'));
            await user.click(await screen.findByText('09:00'));

            await user.click(screen.getByRole('button', { name: 'Create Appointment' }));

            expect(await screen.findByText('Error saving appointment.')).toBeInTheDocument();
        });

        /**
         * Bug it catches:
         * Prevents premature modal closing on submission failure, which would destroy
         * all entered form values without giving the user a chance to retry.
         */
        it('does not close the modal when onSubmit fails', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn().mockRejectedValue(new Error('Network error'));
            const onCloseMock = vi.fn();
            const futureDate = getFutureWeekday();

            const { container } = render(
                <AppointmentModal
                    isOpen={true}
                    onClose={onCloseMock}
                    onSubmit={onSubmitMock}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            // Fill required fields
            await user.click(screen.getByText('Select client...'));
            await user.click(await screen.findByText('Alice Smith'));

            await user.click(screen.getByText('Select services...'));
            await user.click(await screen.findByText('Haircut - 50 RON'));

            const dateInput = container.querySelector('input[type="date"]');
            await user.clear(dateInput);
            await user.type(dateInput, futureDate);

            await user.click(await screen.findByText('Select time...'));
            await user.click(await screen.findByText('09:00'));

            await user.click(screen.getByRole('button', { name: 'Create Appointment' }));

            await waitFor(() => {
                expect(onSubmitMock).toHaveBeenCalled();
            });

            expect(onCloseMock).not.toHaveBeenCalled();
            expect(screen.getByRole('heading', { level: 2, name: 'New Appointment' })).toBeInTheDocument();
        });

        /**
         * Bug it catches:
         * Prevents the submit button from becoming permanently disabled in the "Saving..." state
         * if the backend request rejects.
         */
        it('re-enables submit button and restores action label after onSubmit failure', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn().mockRejectedValue(new Error('Server crash'));
            const futureDate = getFutureWeekday();

            const { container } = render(
                <AppointmentModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSubmit={onSubmitMock}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            // Fill required fields
            await user.click(screen.getByText('Select client...'));
            await user.click(await screen.findByText('Alice Smith'));

            await user.click(screen.getByText('Select services...'));
            await user.click(await screen.findByText('Haircut - 50 RON'));

            const dateInput = container.querySelector('input[type="date"]');
            await user.clear(dateInput);
            await user.type(dateInput, futureDate);

            await user.click(await screen.findByText('Select time...'));
            await user.click(await screen.findByText('09:00'));

            await user.click(screen.getByRole('button', { name: 'Create Appointment' }));

            // Wait for toast to display
            await screen.findByText('Error saving appointment.');

            // Button should be re-enabled with "Create Appointment" label
            const submitBtn = screen.getByRole('button', { name: 'Create Appointment' });
            expect(submitBtn).toBeEnabled();
        });
    });

    // ==========================================
    // 5. API INTERACTIONS SUITE
    // ==========================================
    describe('API interactions', () => {
        /**
         * Bug it catches:
         * Prevents opening the modal without fetching the barber's occupied times,
         * which would otherwise present booked slots as available and risk double-booking.
         */
        it('fetches occupied times on mount for initial barber and initial date', async () => {
            render(
                <AppointmentModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalledTimes(1);
            });

            // Initially barber is barbers[0].id (1)
            expect(appointmentService.getOccupiedTimes).toHaveBeenCalledWith(
                1,
                expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
            );
        });

        /**
         * Bug it catches:
         * Prevents retaining old occupied time slots when the user selects a new appointment date.
         */
        it('re-fetches occupied times with updated date when appointment date changes', async () => {
            const user = userEvent.setup();
            const futureDate = getFutureWeekday();

            const { container } = render(
                <AppointmentModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalled();
            });

            const dateInput = container.querySelector('input[type="date"]');
            await user.clear(dateInput);
            await user.type(dateInput, futureDate);

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalledWith(1, futureDate);
            });
        });

        /**
         * Bug it catches:
         * Prevents retaining the previous barber's occupied schedule when an admin selects a different barber.
         */
        it('re-fetches occupied times with new barber ID when admin changes barber', async () => {
            const user = userEvent.setup();

            render(
                <AppointmentModal
                    isOpen={true}
                    isAdmin={true}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    parsedData={{ barbers: mockBarbers, services: mockServices, users: mockUsers }}
                />
            );

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalledWith(1, expect.any(String));
            });

            // Change barber to Charlie Brown (id: 2)
            await user.click(screen.getByText('Bob Ross'));
            await user.click(await screen.findByText('Charlie Brown'));

            await waitFor(() => {
                expect(appointmentService.getOccupiedTimes).toHaveBeenCalledWith(2, expect.any(String));
            });
        });
    });
});

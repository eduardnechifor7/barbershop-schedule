import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';

describe('AppointmentDetailsModal', () => {
    const mockAppointment = {
        appointment_id: 1234,
        appointment_date: '2025-06-15T12:00:00.000Z',
        start_time: '14:30:00',
        status: 'completed',
        barber_first_name: 'John',
        barber_last_name: 'Doe',
        barber_photo_url: 'https://example.com/barber.jpg',
        services: [
            { service_name: 'Classic Haircut', duration: 30, price_at_booking: 50 },
            { service_name: 'Beard Trim', duration: 15, price_at_booking: 30 },
        ],
    };

    describe('Visibility and Guard Clauses', () => {
        it('returns null when isOpen is false', () => {
            const { container } = render(
                <AppointmentDetailsModal
                    isOpen={false}
                    appointment={mockAppointment}
                    onClose={vi.fn()}
                />
            );
            expect(container).toBeEmptyDOMElement();
        });

        it('returns null when appointment is not passed', () => {
            const { container } = render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={null}
                    onClose={vi.fn()}
                />
            );
            expect(container).toBeEmptyDOMElement();
        });

        it('returns null when appointment is undefined', () => {
            const { container } = render(
                <AppointmentDetailsModal
                    isOpen={true}
                    onClose={vi.fn()}
                />
            );
            expect(container).toBeEmptyDOMElement();
        });

        it('returns null when both isOpen is false and appointment is null', () => {
            const { container } = render(
                <AppointmentDetailsModal
                    isOpen={false}
                    appointment={null}
                    onClose={vi.fn()}
                />
            );
            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('Appointment Details & Visual Rendering', () => {
        it('renders modal header, title, and appointment ID', () => {
            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={mockAppointment}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByText('Appointment Details')).toBeInTheDocument();
            expect(screen.getByText('Appointment ID: #1234')).toBeInTheDocument();
        });

        it('renders fallback appointment ID when appointment_id is missing', () => {
            const appointmentWithoutId = {
                ...mockAppointment,
                appointment_id: null,
            };

            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={appointmentWithoutId}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByText('Appointment ID: #N/A')).toBeInTheDocument();
        });

        it('renders barber full name and photo when provided', () => {
            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={mockAppointment}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByText('Your Barber')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();

            const image = screen.getByRole('img', { name: 'Barber' });
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/barber.jpg');
        });

        it('renders fallback barber name and icon when barber info is missing', () => {
            const appointmentWithoutBarber = {
                ...mockAppointment,
                barber_first_name: null,
                barber_last_name: null,
                barber_photo_url: null,
            };

            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={appointmentWithoutBarber}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByText('Barber')).toBeInTheDocument();
            expect(screen.queryByRole('img', { name: 'Barber' })).not.toBeInTheDocument();
        });

        it('renders formatted time and default time when start_time is missing', () => {
            const { rerender } = render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={mockAppointment}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByText('14:30')).toBeInTheDocument();

            rerender(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={{ ...mockAppointment, start_time: null }}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByText('00:00')).toBeInTheDocument();
        });
    });

    describe('Services & Pricing', () => {
        it('renders list of services with duration and calculated total price', () => {
            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={mockAppointment}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByText('Classic Haircut')).toBeInTheDocument();
            expect(screen.getByText('30 min')).toBeInTheDocument();
            expect(screen.getByText('50 RON')).toBeInTheDocument();

            expect(screen.getByText('Beard Trim')).toBeInTheDocument();
            expect(screen.getByText('15 min')).toBeInTheDocument();
            expect(screen.getByText('30 RON')).toBeInTheDocument();

            // Total price: 50 + 30 = 80 RON
            expect(screen.getByText('Total to pay')).toBeInTheDocument();
            expect(screen.getByText('80 RON')).toBeInTheDocument();

        });

        it('renders total price correctly when services are provided', () => {
            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={
                        {
                            ...mockAppointment,
                            services: [
                                { service_name: 'Service 1', duration: 30, price_at_booking: 49.99 },
                                { service_name: 'Service 2', duration: 15, price_at_booking: 20.02 },
                            ]
                        }
                    }
                    onClose={vi.fn()}
                />
            );
            expect(screen.getByText(/70\.01\s*RON/i)).toBeInTheDocument();
        });

        it('renders "No services" and 0 RON when services array is empty or undefined', () => {
            const appointmentWithoutServices = {
                ...mockAppointment,
                services: [],
            };

            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={appointmentWithoutServices}
                    onClose={vi.fn()}
                />
            );

            expect(screen.getByText('No services')).toBeInTheDocument();
            expect(screen.getByText('0 RON')).toBeInTheDocument();
        });
    });

    describe('Status Badge', () => {
        it('renders completed status badge when status is "completed"', () => {
            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={{ ...mockAppointment, status: 'completed' }}
                    onClose={vi.fn()}
                />
            );

            const badge = screen.getByText('Completed');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('bg-emerald-500/10');
            expect(badge).toHaveClass('text-emerald-400');
            expect(badge).toHaveClass('border-emerald-500/20');
        });

        it('renders cancelled status badge when status is "cancelled"', () => {
            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={{ ...mockAppointment, status: 'cancelled' }}
                    onClose={vi.fn()}
                />
            );

            const badge = screen.getByText('Cancelled');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('bg-red-500/10');
            expect(badge).toHaveClass('text-red-400');
            expect(badge).toHaveClass('border-red-500/20');
        });

        it('does not render status badge when status is unknown or undefined', () => {
            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={{ ...mockAppointment, status: 'pending' }}
                    onClose={vi.fn()}
                />
            );

            expect(screen.queryByText('Completed')).not.toBeInTheDocument();
            expect(screen.queryByText('Cancelled')).not.toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('calls onClose when clicking the header close icon button', async () => {
            const user = userEvent.setup();
            const onCloseMock = vi.fn();

            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={mockAppointment}
                    onClose={onCloseMock}
                />
            );

            const buttons = screen.getAllByRole('button');
            const headerCloseButton = buttons[0];
            await user.click(headerCloseButton);

            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when clicking the bottom "Close" button', async () => {
            const user = userEvent.setup();
            const onCloseMock = vi.fn();

            render(
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={mockAppointment}
                    onClose={onCloseMock}
                />
            );

            const bottomCloseButton = screen.getByRole('button', { name: 'Close' });
            await user.click(bottomCloseButton);

            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });
    });
});

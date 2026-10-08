import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneChangeModal } from './PhoneChangeModal';

describe('PhoneChangeModal', () => {
    // ==========================================
    // 1. RENDERING SUITE
    // ==========================================
    describe('Rendering', () => {
        it('returns null and renders nothing when isOpen is false', () => {
            const { container } = render(
                <PhoneChangeModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
            );
            expect(container).toBeEmptyDOMElement();
        });

        it('renders modal title, description, phone input, SMS notice, and submit button when isOpen is true', () => {
            render(<PhoneChangeModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

            expect(screen.getByRole('heading', { level: 2, name: 'Change Phone' })).toBeInTheDocument();
            expect(screen.getByText('Enter your new phone number')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter new phone number...')).toBeInTheDocument();
            expect(
                screen.getByText('We will send a 6-digit SMS verification code to verify this new number.')
            ).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Send Verification Code' })).toBeInTheDocument();
        });

        it('renders loading spinner and disables buttons and input when isLoading is true', () => {
            const { container } = render(
                <PhoneChangeModal isOpen={true} isLoading={true} onClose={vi.fn()} onSubmit={vi.fn()} />
            );

            const input = screen.getByPlaceholderText('Enter new phone number...');
            const buttons = screen.getAllByRole('button');
            const closeBtn = buttons[0];
            const submitBtn = buttons[1];

            expect(input).toBeDisabled();
            expect(closeBtn).toBeDisabled();
            expect(submitBtn).toBeDisabled();
            expect(container.querySelector('.animate-spin')).toBeInTheDocument();
            expect(screen.queryByText('Send Verification Code')).not.toBeInTheDocument();
        });
    });

    // ==========================================
    // 2. VALIDATION & SUBMISSION SUITE
    // ==========================================
    describe('Validation & Submission', () => {
        it('displays required error when submitting empty input and phone error when phone format is invalid', async () => {
            const user = userEvent.setup();
            const onSubmit = vi.fn();

            render(<PhoneChangeModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

            const submitBtn = screen.getByRole('button', { name: 'Send Verification Code' });

            // 1. Submit empty
            await user.click(submitBtn);
            expect(screen.getByText('• This field is required')).toBeInTheDocument();
            expect(onSubmit).not.toHaveBeenCalled();

            // 2. Submit invalid format (e.g. without country code or too short)
            const input = screen.getByPlaceholderText('Enter new phone number...');
            await user.type(input, '12345');
            await user.click(submitBtn);
            expect(screen.getByText('• Please enter a valid phone number')).toBeInTheDocument();
            expect(onSubmit).not.toHaveBeenCalled();
        });

        it('clears validation error when typing and calls onSubmit with trimmed phone number upon valid submit', async () => {
            const user = userEvent.setup();
            const onSubmit = vi.fn();

            render(<PhoneChangeModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

            const input = screen.getByPlaceholderText('Enter new phone number...');
            const submitBtn = screen.getByRole('button', { name: 'Send Verification Code' });

            // Trigger required validation error
            await user.click(submitBtn);
            expect(screen.getByText('• This field is required')).toBeInTheDocument();

            // Typing clears the error
            await user.type(input, '+40712345678');
            expect(screen.queryByText('• This field is required')).not.toBeInTheDocument();

            // Submit valid phone number
            await user.click(submitBtn);
            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith('+40712345678');
        });
    });

    // ==========================================
    // 3. DISMISSAL SUITE
    // ==========================================
    describe('Dismissal', () => {
        it('calls onClose callback when clicking the header close icon', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            render(<PhoneChangeModal isOpen={true} onClose={onClose} onSubmit={vi.fn()} />);

            const closeBtn = screen.getAllByRole('button')[0];
            await user.click(closeBtn);

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});

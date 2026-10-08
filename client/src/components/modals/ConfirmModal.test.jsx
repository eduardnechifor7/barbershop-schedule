import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from './ConfirmModal';

describe('ConfirmModal', () => {
    const defaultProps = {
        isOpen: true,
        title: 'Delete Appointment',
        message: 'Are you sure you want to cancel this appointment?',
        onClose: vi.fn(),
        onConfirm: vi.fn(),
    };

    it('does not render when isOpen is false', () => {
        const { container } = render(
            <ConfirmModal {...defaultProps} isOpen={false} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders title, message, and default button labels when isOpen is true', () => {
        render(<ConfirmModal {...defaultProps} />);

        expect(screen.getByText('Delete Appointment')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to cancel this appointment?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('renders custom button labels when keepText and confirmText are provided', () => {
        render(
            <ConfirmModal
                {...defaultProps}
                keepText="No, go back"
                confirmText="Yes, delete"
            />
        );

        expect(screen.getByRole('button', { name: 'No, go back' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
    });

    it('calls onClose when clicking the cancel/keep button', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(<ConfirmModal {...defaultProps} onClose={onClose} />);

        await user.click(screen.getByRole('button', { name: 'Keep it' }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when clicking the confirm button', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();

        render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

        await user.click(screen.getByRole('button', { name: 'Confirm' }));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('displays loading state and disables both buttons when isLoading is true', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onConfirm = vi.fn();

        render(
            <ConfirmModal
                {...defaultProps}
                isLoading={true}
                onClose={onClose}
                onConfirm={onConfirm}
            />
        );

        const keepButton = screen.getByRole('button', { name: 'Keep it' });
        const confirmButton = screen.getByRole('button', { name: 'Processing...' });

        expect(keepButton).toBeDisabled();
        expect(confirmButton).toBeDisabled();

        await user.click(keepButton);
        await user.click(confirmButton);

        expect(onClose).not.toHaveBeenCalled();
        expect(onConfirm).not.toHaveBeenCalled();
    });
});

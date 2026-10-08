import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpSupportModal } from './HelpSupportModal';

describe('HelpSupportModal', () => {
    /**
     * Bug it catches:
     * Prevents modal backdrop or DOM content from rendering when isOpen is false.
     */
    it('returns null and renders nothing when isOpen is false', () => {
        const { container } = render(
            <HelpSupportModal isOpen={false} onClose={vi.fn()} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    /**
     * Bug it catches:
     * Prevents modal from omitting default salon contact info or modal header text.
     */
    it('renders modal header, opening hours, and default contact details when isOpen is true', () => {
        render(<HelpSupportModal isOpen={true} onClose={vi.fn()} />);

        // Header
        expect(screen.getByRole('heading', { level: 2, name: 'Help & Support' })).toBeInTheDocument();
        expect(screen.getByText('Salon contact & opening hours')).toBeInTheDocument();

        // Opening Hours
        expect(screen.getByText('Opening Hours')).toBeInTheDocument();
        expect(screen.getByText('Monday – Friday: 09:00 AM – 05:00 PM')).toBeInTheDocument();
        expect(screen.getByText('Saturday – Sunday: Closed')).toBeInTheDocument();

        // Default Phone & Link
        expect(screen.getByText('+40 700 000 000')).toBeInTheDocument();
        const phoneLink = screen.getByText('+40 700 000 000').closest('a');
        expect(phoneLink).toHaveAttribute('href', 'tel:+40700000000');

        // Default Email & Link
        expect(screen.getByText('contact@salon.com')).toBeInTheDocument();
        const emailLink = screen.getByText('contact@salon.com').closest('a');
        expect(emailLink).toHaveAttribute('href', 'mailto:contact@salon.com');

        // Default Address
        expect(screen.getByText('Street ABC 10, Bucharest')).toBeInTheDocument();

        // Close button
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    /**
     * Bug it catches:
     * Prevents modal from ignoring custom contact info props or malformatting tel/mailto href attributes.
     */
    it('renders custom salon contact details and formatted href links when props are provided', () => {
        const customProps = {
            isOpen: true,
            onClose: vi.fn(),
            phone: '+40 711 222 333',
            email: 'support@barbershop.com',
            address: 'Custom Boulevard 42, Cluj-Napoca',
            schedule: 'Tuesday – Saturday: 10:00 AM – 08:00 PM',
        };

        render(<HelpSupportModal {...customProps} />);

        expect(screen.getByText('Tuesday – Saturday: 10:00 AM – 08:00 PM')).toBeInTheDocument();
        expect(screen.getByText('Custom Boulevard 42, Cluj-Napoca')).toBeInTheDocument();

        const phoneLink = screen.getByText('+40 711 222 333').closest('a');
        expect(phoneLink).toHaveAttribute('href', 'tel:+40711222333');

        const emailLink = screen.getByText('support@barbershop.com').closest('a');
        expect(emailLink).toHaveAttribute('href', 'mailto:support@barbershop.com');
    });

    /**
     * Bug it catches:
     * Prevents close actions (header X icon or bottom Close button) from failing to call onClose.
     */
    it('calls onClose callback when clicking the header close icon or the bottom Close button', async () => {
        const user = userEvent.setup();
        const onCloseMock = vi.fn();

        render(<HelpSupportModal isOpen={true} onClose={onCloseMock} />);

        // Header close button (the first button element inside header)
        const buttons = screen.getAllByRole('button');
        const headerCloseBtn = buttons[0];
        await user.click(headerCloseBtn);
        expect(onCloseMock).toHaveBeenCalledTimes(1);

        // Bottom "Close" button
        const bottomCloseBtn = screen.getByRole('button', { name: 'Close' });
        await user.click(bottomCloseBtn);
        expect(onCloseMock).toHaveBeenCalledTimes(2);
    });
});

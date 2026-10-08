import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorScreen } from './ErrorScreen';

describe('ErrorScreen', () => {
    it('renders with default error text', () => {
        render(<ErrorScreen />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Failed to load your page')).toBeInTheDocument();
    });

    it('renders with custom error text', () => {
        render(<ErrorScreen errorText="Custom error message" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('calls onRetry when the Retry button is clicked', async () => {
        const onRetryMock = vi.fn();

        render(<ErrorScreen onRetry={onRetryMock} />);

        await screen.getByRole('button', { name: "Retry" }).click();

        expect(onRetryMock).toHaveBeenCalledTimes(1);
    });
});
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
    describe('completed status', () => {
        it('renders completed badge when status is "completed"', () => {
            render(<StatusBadge status="completed" />);
            const badge = screen.getByText('Completed');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('text-emerald-400');
            expect(badge).toHaveClass('bg-emerald-500/10');
            expect(badge).toHaveClass('border-emerald-500/20');
        });

        it('renders completed badge when status is "finished"', () => {
            render(<StatusBadge status="finished" />);
            const badge = screen.getByText('Completed');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('text-emerald-400');
        });

        it('handles case-insensitive values for completed', () => {
            render(<StatusBadge status="COMPLETED" />);
            expect(screen.getByText('Completed')).toBeInTheDocument();
        });

        it('handles case-insensitive values for finished', () => {
            render(<StatusBadge status="Finished" />);
            expect(screen.getByText('Completed')).toBeInTheDocument();
        });
    });

    describe('cancelled status', () => {
        it('renders cancelled badge when status is "cancelled"', () => {
            render(<StatusBadge status="cancelled" />);
            const badge = screen.getByText('Cancelled');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('text-red-400');
            expect(badge).toHaveClass('bg-red-500/10');
            expect(badge).toHaveClass('border-red-500/20');
        });

        it('handles case-insensitive values for cancelled', () => {
            render(<StatusBadge status="CANCELLED" />);
            expect(screen.getByText('Cancelled')).toBeInTheDocument();
        });
    });

    describe('default / scheduled status', () => {
        it('renders scheduled badge when status is "scheduled"', () => {
            render(<StatusBadge status="scheduled" />);
            const badge = screen.getByText('Scheduled');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('text-amber-400');
            expect(badge).toHaveClass('bg-amber-500/10');
            expect(badge).toHaveClass('border-amber-500/20');
        });

        it('renders scheduled badge when status is unknown', () => {
            render(<StatusBadge status="pending" />);
            const badge = screen.getByText('Scheduled');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('text-amber-400');
        });

        it('renders scheduled badge when status is null or undefined', () => {
            const { rerender } = render(<StatusBadge status={null} />);
            expect(screen.getByText('Scheduled')).toBeInTheDocument();

            rerender(<StatusBadge status={undefined} />);
            expect(screen.getByText('Scheduled')).toBeInTheDocument();

            rerender(<StatusBadge />);
            expect(screen.getByText('Scheduled')).toBeInTheDocument();
        });
    });
});

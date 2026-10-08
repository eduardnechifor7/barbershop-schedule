import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default loading label', () => {
        render(<LoadingSpinner />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
        render(<LoadingSpinner label="Please wait..." />);
        expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormModal } from './FormModal';
import { supabase } from '../../supabase.js';

// Mock Supabase storage
vi.mock('../../supabase.js', () => ({
    supabase: {
        storage: {
            from: vi.fn(),
        },
    },
}));

// Mock Sentry to prevent telemetry errors during tests
vi.mock('@sentry/react', () => ({
    captureException: vi.fn(),
}));

const mockConfig = {
    'Service Name': 'service_name',
    'Price': 'price',
    'Category': 'category',
    'Skills': 'skills_ids',
};

const mockOptions = {
    category: [
        { value: 'hair', label: 'Hair Service' },
        { value: 'beard', label: 'Beard Service' },
    ],
    skills_ids: [
        { value: 1, label: 'Styling' },
        { value: 2, label: 'Beard Care' },
    ],
};

const mockPhotoConfig = {
    'Service Name': 'service_name',
    'Photo': 'photo_url',
};

describe('FormModal', () => {
    let mockStorage;

    beforeEach(() => {
        vi.clearAllMocks();
        mockStorage = {
            upload: vi.fn().mockResolvedValue({ error: null }),
            getPublicUrl: vi.fn().mockReturnValue({
                data: { publicUrl: 'https://example.com/storage/v1/object/public/Avatars/uploaded-pic.png' },
            }),
            remove: vi.fn().mockResolvedValue({ error: null }),
        };
        supabase.storage.from.mockReturnValue(mockStorage);
    });

    // ==========================================
    // 1. RENDERING SUITE
    // ==========================================
    describe('Rendering', () => {
        /**
         * Bug it catches:
         * Prevents modal DOM elements and backdrop from lingering in the document tree when isOpen is false.
         */
        it('returns null and renders nothing when isOpen is false', () => {
            const { container } = render(
                <FormModal
                    isOpen={false}
                    config={mockConfig}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />
            );
            expect(container).toBeEmptyDOMElement();
        });

        /**
         * Bug it catches:
         * Prevents rendering the wrong modal header in create mode,
         * or omitting configured form fields and primary action buttons.
         */
        it('renders modal title "Add New Record", configured form fields, and default action buttons in create mode', () => {
            render(
                <FormModal
                    isOpen={true}
                    config={mockConfig}
                    options={mockOptions}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByRole('heading', { level: 2, name: 'Add New Record' })).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Service Name')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Price')).toBeInTheDocument();
            expect(screen.getByText('Select category...')).toBeInTheDocument();
            expect(screen.getByText('Select skills...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        });

        /**
         * Bug it catches:
         * Prevents edit mode from failing to hydrate existing record fields
         * or rendering "Add New Record" instead of "Edit Record".
         */
        it('renders modal title "Edit Record" and pre-populates existing record data in edit mode', () => {
            const initialData = {
                service_name: 'Beard Trim',
                price: '35',
                category: 'beard',
                skills_ids: [2],
            };

            render(
                <FormModal
                    isOpen={true}
                    isEdit={true}
                    initialData={initialData}
                    config={mockConfig}
                    options={mockOptions}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByRole('heading', { level: 2, name: 'Edit Record' })).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Service Name')).toHaveValue('Beard Trim');
            expect(screen.getByPlaceholderText('Price')).toHaveValue('35');
            expect(screen.getByText('Beard Service')).toBeInTheDocument();
            expect(screen.getByText('Beard Care')).toBeInTheDocument();
        });

        /**
         * Bug it catches:
         * Prevents dismissal actions (Cancel button or header close icon) from malfunctioning.
         */
        it('calls onClose callback when clicking the Cancel button or the header close icon', async () => {
            const user = userEvent.setup();
            const onCloseMock = vi.fn();

            render(
                <FormModal
                    isOpen={true}
                    config={mockConfig}
                    onClose={onCloseMock}
                    onSubmit={vi.fn()}
                />
            );

            // Click Cancel button
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            expect(onCloseMock).toHaveBeenCalledTimes(1);

            // Click header close button (the first button in modal header)
            const buttons = screen.getAllByRole('button');
            const headerCloseBtn = buttons[0];
            await user.click(headerCloseBtn);
            expect(onCloseMock).toHaveBeenCalledTimes(2);
        });
    });

    // ==========================================
    // 2. VALIDATION SUITE
    // ==========================================
    describe('Validation', () => {
        /**
         * Bug it catches:
         * Prevents submitting an empty form missing required inputs (e.g., service name, price, skills),
         * which would otherwise cause backend 400 Bad Request or null constraint violations.
         */
        it('displays validation error messages for required fields when submitting an empty form in create mode', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn();

            render(
                <FormModal
                    isOpen={true}
                    config={mockConfig}
                    options={mockOptions}
                    onClose={vi.fn()}
                    onSubmit={onSubmitMock}
                />
            );

            await user.click(screen.getByRole('button', { name: 'Submit' }));

            const requiredErrors = screen.getAllByText('• This field is required');
            expect(requiredErrors.length).toBe(2); // service_name and price
            expect(screen.getByText('• Please select at least 1 item(s)')).toBeInTheDocument(); // skills_ids
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        /**
         * Bug it catches:
         * Catches invalid formats (e.g. non-letters in text-only fields or negative prices)
         * and prevents premature submission while rules are violated.
         */
        it('blocks onSubmit from firing and displays format validation errors when inputs violate rules', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn();

            render(
                <FormModal
                    isOpen={true}
                    config={mockConfig}
                    options={mockOptions}
                    onClose={vi.fn()}
                    onSubmit={onSubmitMock}
                />
            );

            // Type numbers into textOnly service_name and negative value into positiveNumber price
            await user.type(screen.getByPlaceholderText('Service Name'), 'Cut 123');
            await user.type(screen.getByPlaceholderText('Price'), '-10');

            await user.click(screen.getByRole('button', { name: 'Submit' }));

            expect(screen.getByText('• Please enter only letters and spaces')).toBeInTheDocument();
            expect(screen.getByText('• Please enter a positive number')).toBeInTheDocument();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // 3. SUBMISSION SUITE
    // ==========================================
    describe('Submission', () => {
        /**
         * Bug it catches:
         * Prevents submitting a malformed payload or failing to trigger onClose and reset state
         * after a valid record creation.
         */
        it('submits correct form payload and triggers onClose upon successful create submission', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn();
            const onCloseMock = vi.fn();

            render(
                <FormModal
                    isOpen={true}
                    config={mockConfig}
                    options={mockOptions}
                    onClose={onCloseMock}
                    onSubmit={onSubmitMock}
                />
            );

            // Fill text fields
            await user.type(screen.getByPlaceholderText('Service Name'), 'Classic Haircut');
            await user.type(screen.getByPlaceholderText('Price'), '50');

            // Select single option from category
            await user.click(screen.getByText('Select category...'));
            await user.click(await screen.findByText('Hair Service'));

            // Select multi option from skills
            await user.click(screen.getByText('Select skills...'));
            await user.click(await screen.findByText('Styling'));

            // Submit form
            await user.click(screen.getByRole('button', { name: 'Submit' }));

            expect(onSubmitMock).toHaveBeenCalledWith({
                service_name: 'Classic Haircut',
                price: '50',
                category: 'hair',
                skills_ids: [1],
            });
            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });

        /**
         * Bug it catches:
         * Prevents edit mode from submitting stale initialData rather than user-modified form values.
         */
        it('submits modified form payload and triggers onClose upon successful edit submission', async () => {
            const user = userEvent.setup();
            const onSubmitMock = vi.fn();
            const onCloseMock = vi.fn();

            const initialData = {
                service_name: 'Beard Trim',
                price: '35',
                category: 'beard',
                skills_ids: [2],
            };

            render(
                <FormModal
                    isOpen={true}
                    isEdit={true}
                    initialData={initialData}
                    config={mockConfig}
                    options={mockOptions}
                    onClose={onCloseMock}
                    onSubmit={onSubmitMock}
                />
            );

            // Modify price
            const priceInput = screen.getByPlaceholderText('Price');
            await user.clear(priceInput);
            await user.type(priceInput, '45');

            // Submit changes
            await user.click(screen.getByRole('button', { name: 'Submit' }));

            expect(onSubmitMock).toHaveBeenCalledWith({
                service_name: 'Beard Trim',
                price: '45',
                category: 'beard',
                skills_ids: [2],
            });
            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });
    });

    // ==========================================
    // 4. FILE UPLOAD & STORAGE SUITE
    // ==========================================
    describe('File upload & Storage', () => {
        /**
         * Bug it catches:
         * Prevents avatar file input from failing to upload to Supabase storage
         * or failing to update photo_url in form state.
         */
        it('uploads file to storage and updates photo_url upon selecting a file', async () => {
            const user = userEvent.setup();
            const { container } = render(
                <FormModal
                    isOpen={true}
                    config={mockPhotoConfig}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByText('No file selected')).toBeInTheDocument();

            const file = new File(['dummy avatar content'], 'avatar.png', { type: 'image/png' });
            const fileInput = container.querySelector('input[type="file"]');
            await user.upload(fileInput, file);

            await waitFor(() => {
                expect(mockStorage.upload).toHaveBeenCalledTimes(1);
            });
            expect(mockStorage.getPublicUrl).toHaveBeenCalledTimes(1);

            // Shows the updated file name from the public URL
            expect(await screen.findByText('uploaded-pic.png')).toBeInTheDocument();
        });

        /**
         * Bug it catches:
         * Prevents silent avatar upload failures that leave the user unaware of storage errors.
         */
        it('displays error toast notification when avatar upload fails', async () => {
            const user = userEvent.setup();
            mockStorage.upload.mockResolvedValueOnce({
                error: { message: 'Storage bucket quota exceeded' },
            });

            const { container } = render(
                <FormModal
                    isOpen={true}
                    config={mockPhotoConfig}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />
            );

            const file = new File(['content'], 'avatar.png', { type: 'image/png' });
            const fileInput = container.querySelector('input[type="file"]');
            await user.upload(fileInput, file);

            expect(await screen.findByText('Storage bucket quota exceeded')).toBeInTheDocument();
        });
    });
});

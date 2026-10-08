import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthPhoneInput } from './AuthPhoneInput';
import {userEvent} from "@testing-library/user-event/dist/cjs/setup/index.js";

describe('AuthPhoneInput', () => {
    it('renders the phone input and calls onChange when the value changes', async () => {
        const user = userEvent.setup();
        const onChangeMock = vi.fn();

        render(<AuthPhoneInput onChange={onChangeMock} />);

        const input = screen.getByPlaceholderText(/phone number/i);
        expect(input).toBeInTheDocument();

        await user.type(input, '1234567890');
        expect(onChangeMock).toHaveBeenCalled();
    });
});
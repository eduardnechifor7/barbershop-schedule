import 'react-phone-number-input/style.css';
import PhoneInput from "react-phone-number-input";

export function AuthPhoneInput({ onChange, value }) {

    return (
        <div className="auth-phone-container">
            <PhoneInput
                placeholder="Phone number"
                value={value}
                onChange={onChange}
                defaultCountry="RO"
                numberInputProps={{
                    className: "block w-full border bg-white text-black text-base placeholder:text-base placeholder:text-gray-pc border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold p-2 hover:bg-[#e6edf0]"
                }}
                className="flex gap-2"
            />
        </div>
    );
}
import { TextInput } from "flowbite-react";

export function AuthInput({ placeholder, type = "text", width = "w-full", value, onChange }) {

    return (
        <div className={width}>
            <TextInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                type={type}
                theme={{
                    field: {
                        input: {
                            base: "block w-full border bg-white text-black placeholder:text-gray-pc border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold p-3"
                        }
                    }
                }}
            />
        </div>
    );
}
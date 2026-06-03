import React from 'react';

export function Dropdown({ name, type, value, onChange, options, placeholder = "Select..." }) {

    return (
        <div className="flex flex-col gap-2 w-full">
            <select name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    className="block w-full border bg-white text-black text-sm border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold p-2 hover:bg-[#e6edf0] cursor-pointer"
                    >
                <option value="" className="text-gray-pc">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
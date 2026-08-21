
export const BOOKING_SELECT_STYLES = {
    control: () =>
        "w-full bg-[#262424] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-[#F2EFE9] focus-within:border-[#DBB668] transition-all cursor-pointer flex items-center min-h-[46px]",
    menu: () =>
        "!bg-[#262424] border border-white/10 rounded-xl mt-2 overflow-y-auto shadow-2xl z-50",
    option: ({ isFocused, isSelected }) =>
        `p-3 text-sm cursor-pointer transition-colors ${
            isSelected
                ? "bg-[#DBB668] text-[#121212] font-semibold"
                : isFocused
                    ? "bg-[#DBB668]/15 text-[#F2EFE9]"
                    : "text-[#F2EFE9]"
        }`,
    singleValue: () => "text-[#F2EFE9] text-sm",
    multiValue: () =>
        "bg-[#DBB668]/20 border border-[#DBB668]/40 rounded-lg px-2 py-0.5 mr-1.5 text-[#F2EFE9] flex items-center gap-1",
    multiValueLabel: () => "text-xs font-medium text-[#F2EFE9]",
    multiValueRemove: () =>
        "text-gray-400 hover:text-[#DBB668] transition-colors cursor-pointer",
    placeholder: () => "text-gray-400 text-sm",
    input: () => "text-[#F2EFE9] text-sm"
};

export const FORM_SELECT_STYLES = {
    control: (base, state) => ({
        ...base,
        backgroundColor: '#242323',
        borderColor: state.isFocused ? '#DBB668' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        padding: '2px',
        boxShadow: 'none',
        '&:hover': {
            borderColor: 'rgba(219, 182, 104, 0.5)',
        },
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#242323',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        zIndex: 60,
    }),
    valueContainer: (base) => ({
        ...base,
        backgroundColor: 'transparent',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#DBB668'
            : state.isFocused
                ? 'rgba(219, 182, 104, 0.15)'
                : 'transparent',
        color: state.isSelected ? '#1A1919' : '#F2EFE9',
        fontSize: '0.875rem',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#DBB668',
            color: '#1A1919',
        },
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: 'rgba(219, 182, 104, 0.15)',
        borderRadius: '0.5rem',
        border: '1px solid rgba(219, 182, 104, 0.3)',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#DBB668',
        fontWeight: '600',
        fontSize: '0.75rem',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#DBB668',
        ':hover': {
            backgroundColor: '#DBB668',
            color: '#1A1919',
        },
    }),
    placeholder: (base) => ({
        ...base,
        color: '#9CA3AF',
        fontSize: '0.875rem',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#F2EFE9',
        backgroundColor: 'transparent',
        fontSize: '0.875rem',
    }),
    input: (base) => ({
        ...base,
        color: '#F2EFE9',
    }),
};

export const STATUS_ICON_STYLES = {
    completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
};